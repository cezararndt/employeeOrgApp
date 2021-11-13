import { ActionHistory } from "../interfaces/ActionHistory";
import { ChangeSupervisorResult } from "../interfaces/ChangeSupervisorResult";

export class EmployeeOrgApp implements IEmployeeOrgApp {
  public ceo: Employee;
  public flatList: Employee[] = [];
  public history: ActionHistory[];
  public currentActionIndex: number;

  constructor(ceo: Employee) {
    this.ceo = ceo;
    this.history = [];
    this.currentActionIndex = 0;
    this.updateFlatList();
  }

  public move(employeeID: number, supervisorID: number): void {
    if (employeeID === supervisorID) {
      throw new Error(
        `Employee and Supervisor cannot be the same, Employee:${employeeID}, Supervisor:${supervisorID}`
      );
    }

    if (employeeID === this.ceo.uniqueId) {
      throw new Error(`The CEO Cannot be a subordinate`);
    }

    const [employee, supervisor] = this.find(employeeID, supervisorID);

    if (!employee) {
      throw new Error(`Employee ${employeeID} was not found`);
    }
    if (!supervisor) {
      throw new Error(`Employee ${supervisorID} was not found`);
    }

    const { oldSupervisor, oldSubordinatesIds } = this.changeSupervisor(
      employee,
      supervisor
    );

    this.registerAction(
      employee,
      supervisor,
      oldSupervisor,
      oldSubordinatesIds
    );
  }

  public find(...ids: number[]): (Employee | null)[] {
    const found: (Employee | null)[] = [];

    const filtered = this.flatList.filter(({ uniqueId }) =>
      ids.includes(uniqueId)
    );

    ids.forEach((id) => {
      const employee = filtered.find(({ uniqueId }) => uniqueId === id);
      found.push(employee || null);
    });

    return found;
  }

  public undo(): void {
    if (this.currentActionIndex > 0) {
      this.currentActionIndex--;
      this.history[this.currentActionIndex].undo();
    }
  }

  public redo(): void {
    if (this.currentActionIndex < this.history.length) {
      this.history[this.currentActionIndex].redo();
      this.currentActionIndex++;
    }
  }

  private registerAction(
    employee: Employee,
    supervisor: Employee,
    oldSupervisor?: Employee,
    oldSubordinates?: number[]
  ) {
    if (oldSupervisor && oldSubordinates) {
      if (this.currentActionIndex < this.history.length) {
        this.history.splice(this.currentActionIndex);
      }

      this.history.push({
        description: `Change Supervisor of ${employee.name} from ${oldSupervisor.name} to ${supervisor.name}`,
        undo: () => {
          this.changeSupervisor(employee, oldSupervisor);

          if (oldSubordinates.length) {
            employee.subordinates = this.find(...oldSubordinates) as Employee[];

            oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
              (subordinate) => !oldSubordinates.includes(subordinate.uniqueId)
            );
          }
        },
        redo: () => {
          this.changeSupervisor(employee, supervisor);
        },
      });

      this.currentActionIndex++;
    }
  }

  private changeSupervisor(
    employee: Employee,
    newSupervisor: Employee
  ): ChangeSupervisorResult {
    let result: ChangeSupervisorResult = {};

    for (let i = 0, j = this.flatList.length; i < j; i++) {
      const supervisor = this.flatList[i];

      const SupervisorSubordinates = supervisor.subordinates;
      const employeeSubordinates = employee.subordinates;

      if (this.isSupervisorOf(employee, newSupervisor)) {
        throw new Error(
          `The employee ${employee.name} is supervisor of ${newSupervisor.name}`
        );
      }

      const foundEmployee = SupervisorSubordinates.find(
        ({ uniqueId }) => uniqueId === employee.uniqueId
      );

      if (foundEmployee) {
        if (supervisor.uniqueId === newSupervisor.uniqueId) {
          throw new Error(
            `The employee ${employee.uniqueId} it already subordinate of ${newSupervisor.uniqueId}`
          );
        }

        supervisor.subordinates = SupervisorSubordinates.filter(
          ({ uniqueId }) => uniqueId !== employee.uniqueId
        );
        if (employeeSubordinates.length) {
          employeeSubordinates.forEach((subordinate) => {
            supervisor.subordinates.push(subordinate);
          });
        }

        result = {
          oldSupervisor: supervisor,
          oldSubordinatesIds: employeeSubordinates.map(
            (subordinate) => subordinate.uniqueId
          ),
        };
        employee.subordinates = [];
        newSupervisor.subordinates.push(employee);

        break;
      }
    }
    return result;
  }

  public isSupervisorOf(employee: Employee, newSupervisor: Employee): boolean {
    const subordinates = employee.subordinates;

    let found = subordinates.some(
      (subordinate) => subordinate.uniqueId === newSupervisor.uniqueId
    );
    if (found) {
      return true;
    }

    for (let i = 0, j = subordinates.length; i < j; i++) {
      found = this.isSupervisorOf(subordinates[i], newSupervisor);
      if (found) {
        return true;
      }
    }

    return false;
  }

  private updateFlatList(): void {
    this.flatList = this.flattenSubordinates().concat(this.ceo);
  }

  private flattenSubordinates(employee: Employee = this.ceo): Employee[] {
    let flatList: Employee[] = employee.subordinates.flat();

    employee.subordinates.forEach(
      (subordinate) =>
        (flatList = flatList.concat(this.flattenSubordinates(subordinate)))
    );

    return flatList;
  }
}
