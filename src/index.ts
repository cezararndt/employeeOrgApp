import { EmployeeOrgApp } from "./impl/EmployeeOrgApp";
import { RenderEmployees } from "./impl/RenderEmployees";
import "./styles/entry.sass";

(() => {
  const ceo: Employee = {
    uniqueId: 1,
    name: "Mark Zuckerberg",
    subordinates: [],
  };

  ceo.subordinates.push(
    {
      uniqueId: 2,
      name: "Sarah Donald",
      subordinates: [
        {
          uniqueId: 6,
          name: "Cassandra Reynolds",
          subordinates: [
            {
              uniqueId: 7,
              name: "Mary Blue",
              subordinates: [],
            },
            {
              uniqueId: 8,
              name: "Bob Saget",
              subordinates: [
                {
                  uniqueId: 9,
                  name: "Tina Teff",
                  subordinates: [
                    {
                      uniqueId: 10,
                      name: "Will Turner",
                      subordinates: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      uniqueId: 3,
      name: "Tyler Simpson",
      subordinates: [
        {
          uniqueId: 11,
          name: "Harry Tobs",
          subordinates: [
            {
              uniqueId: 14,
              name: "Thomas Brown",
              subordinates: [],
            },
          ],
        },
        {
          uniqueId: 12,
          name: "George Carrey",
          subordinates: [],
        },
        {
          uniqueId: 13,
          name: "Gary Styles",
          subordinates: [],
        },
      ],
    },
    {
      uniqueId: 4,
      name: "Bruce Willis",
      subordinates: [],
    },
    {
      uniqueId: 5,
      name: "Georgina Flangy",
      subordinates: [
        {
          uniqueId: 15,
          name: "Sophie Turner",
          subordinates: [],
        },
      ],
    }
  );

  const org: EmployeeOrgApp = new EmployeeOrgApp(ceo);
  const list = new RenderEmployees(org);
  list.render();
})();
