import { Job } from "./types";

const now = new Date();
const iso = (daysAgo = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const seedJobs: Job[] = [
  {
    id: "PDM-1001",
    title: "Injector Plate Rev A",
    status: "Awaiting Check",
    stock: "6061-T6 Aluminum",
    desiredCompletionDate: "2026-09-18",
    checker: "Raag",
    approver: "Jack",
    originalComments: "Critical sealing face. Verify all hole callouts before release.",
    createdAt: iso(3),
    versions: [
      {
        id: "v-1001-1",
        version: 1,
        type: "Original Submission",
        uploadedBy: "Engineering User",
        uploadedAt: iso(3),
        filename: "injector_plate_revA.pdf"
      }
    ],
    comments: [],
    workflow: [
      { id: "w-1001-1", event: "Job created", actor: "Engineering User", createdAt: iso(3) },
      { id: "w-1001-2", event: "Submitted for check", actor: "Engineering User", createdAt: iso(3) }
    ]
  },
  {
    id: "PDM-1002",
    title: "Valve Body Rev C",
    status: "Work in Progress",
    stock: "316 Stainless Steel",
    desiredCompletionDate: "2026-09-25",
    checker: "Jack",
    approver: "Raag",
    originalComments: "Updated port geometry after fit check.",
    createdAt: iso(7),
    versions: [
      {
        id: "v-1002-1",
        version: 1,
        type: "Original Submission",
        uploadedBy: "Engineering User",
        uploadedAt: iso(7),
        filename: "valve_body_revB.pdf"
      },
      {
        id: "v-1002-2",
        version: 2,
        type: "Checker Markup",
        uploadedBy: "Jack",
        uploadedAt: iso(5),
        filename: "valve_body_revB_checker_markup.pdf"
      }
    ],
    comments: [
      {
        id: "c-1002-1",
        author: "Jack",
        role: "Checker",
        createdAt: iso(5),
        comment: "Please add the missing surface finish on the sealing bore and confirm the thread depth."
      }
    ],
    workflow: [
      { id: "w-1002-1", event: "Job created", actor: "Engineering User", createdAt: iso(7) },
      { id: "w-1002-2", event: "Submitted for check", actor: "Engineering User", createdAt: iso(7) },
      { id: "w-1002-3", event: "Sent back to WIP", actor: "Jack", createdAt: iso(5) }
    ]
  },
  {
    id: "PDM-1003",
    title: "Sensor Bracket Rev B",
    status: "Awaiting Manufacturing",
    stock: "7075-T6 Aluminum",
    desiredCompletionDate: "2026-09-10",
    checker: "Jack",
    approver: "Raag",
    originalComments: "Maintain datum A flatness; bracket interfaces with optical sensor mount.",
    createdAt: iso(10),
    versions: [
      {
        id: "v-1003-1",
        version: 1,
        type: "Original Submission",
        uploadedBy: "Engineering User",
        uploadedAt: iso(10),
        filename: "sensor_bracket_revB.pdf"
      },
      {
        id: "v-1003-2",
        version: 2,
        type: "Final Approved Drawing",
        uploadedBy: "Raag",
        uploadedAt: iso(2),
        filename: "sensor_bracket_revB_approved.pdf"
      }
    ],
    comments: [
      {
        id: "c-1003-1",
        author: "Jack",
        role: "Checker",
        createdAt: iso(4),
        comment: "Dimensions and tolerances checked. Ready for approval."
      },
      {
        id: "c-1003-2",
        author: "Raag",
        role: "Approver",
        createdAt: iso(2),
        comment: "Approved for manufacturing."
      }
    ],
    workflow: [
      { id: "w-1003-1", event: "Job created", actor: "Engineering User", createdAt: iso(10) },
      { id: "w-1003-2", event: "Submitted for check", actor: "Engineering User", createdAt: iso(10) },
      { id: "w-1003-3", event: "Checker passed", actor: "Jack", createdAt: iso(4) },
      { id: "w-1003-4", event: "Approved for manufacturing", actor: "Raag", createdAt: iso(2) }
    ]
  }
];
