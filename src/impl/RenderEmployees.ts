import { EmployeeOrgApp } from "./EmployeeOrgApp";

const template = `
<main id="content">
  <div id="list"></div>

  <div id="actions">
    <button id="undo">Undo</button>
    <button id="redo">Redo</button>
  </div>

  <form>
    <label>Employee</label>
    <select name="selectEmployee"></select>
    <label>Supervisor</label>
    <select name="selectSupervisor"></select>
    <button id="update-employee">Update</button>
  </form>

  <div id="history"></div>

</main>`;

export class RenderEmployees {
  private app: EmployeeOrgApp;

  constructor(app: EmployeeOrgApp) {
    this.app = app;
    document.body.insertAdjacentHTML("afterbegin", template);

    document.querySelector("#undo")?.addEventListener("click", () => {
      this.app.undo();
      this.render();
    });

    document.querySelector("#redo")?.addEventListener("click", () => {
      this.app.redo();
      this.render();
    });

    document.querySelector("[name=selectEmployee]")!.innerHTML =
      this.htmlOptions(this.app.flatList);

    document.querySelector("[name=selectSupervisor]")!.innerHTML =
      this.htmlOptions(this.app.flatList);

    document.querySelector("form")!.addEventListener("submit", (e) => {
      const form = e.target as HTMLFormElement;
      const employee = Number(form.selectEmployee.value);
      const supervisor = Number(form.selectSupervisor.value);

      if (employee && supervisor) {
        try {
          this.app.move(employee, supervisor);
          form.reset();
          this.render();
        } catch (error) {
          console.error(error);
        }
      }

      e.preventDefault();
    });
  }

  render() {
    let content = this.renderEmployees(this.app.ceo);
    document.querySelector("#list")!.innerHTML = content;
    document.querySelector("#history")!.innerHTML = this.renderHistory();

    this.toggleAction();
  }

  renderEmployees(employee: Employee, level: number = 1): string {
    const content: string[] = [this.htmlRow(employee, level)];

    level = employee.subordinates.length ? ++level : level;

    employee.subordinates
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .forEach((subordinate) => {
        content.push(this.renderEmployees(subordinate, level));
      });

    return content.join("");
  }

  renderHistory(): string {
    return `<ul>
    ${this.app.history
      .map(
        (action, key) =>
          `<li style="font-weight:${
            key === this.app.currentActionIndex - 1 ? "bold" : "normal"
          }">${action.description}</li>`
      )
      .join("")}
    </ul>`;
  }

  toggleAction() {
    const undoButton = document.querySelector("#undo") as HTMLButtonElement;
    const redoButton = document.querySelector("#redo") as HTMLButtonElement;

    undoButton.removeAttribute("disabled");
    redoButton.removeAttribute("disabled");

    if (this.app.currentActionIndex === 0) {
      undoButton.setAttribute("disabled", "");
    }

    if (this.app.currentActionIndex === this.app.history.length) {
      redoButton.setAttribute("disabled", "");
    }
  }

  htmlRow(employee: Employee, padding: number = 0): string {
    return `<div style="padding-left:${padding * 20}px">${employee.name}</div>`;
  }

  htmlOptions(employee: Employee[]): string {
    return ['<option value=""></option>']
      .concat(
        employee
          .sort((a, b) => (a.uniqueId < b.uniqueId ? -1 : 1))
          .map(
            (employee) =>
              `<option value="${employee.uniqueId}">${employee.name}</option>`
          )
      )
      .join("");
  }
}
