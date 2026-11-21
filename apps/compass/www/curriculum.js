const MODULES = [["Creative foundations", "L0\u20132 \u2022 Scratch", 1, 10, "Creative coder"], ["Python playground", "L1\u20132 / L8 \u2022 Python", 11, 21, "Python builder"], ["Algorithms & data", "L3\u20135 / L7 extension", 22, 31, "Problem solver"], ["Web & discovery", "L6 / L9\u201311", 32, 39, "Web explorer"], ["Your big idea", "L12 \u2022 Capstone", 40, 46, "Project maker"], ["Show what you know", "Review & showcase", 47, 49, "Showcase star"]];
const SESSIONS = [
  {
    "id": 1,
    "date": "2026-11-23",
    "title": "Re-entry lab",
    "objective": "Open, change, run, and save a project.",
    "activity": "Revisit a Scratch project; change its background, dialogue, and motion.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 2,
    "date": "2026-11-25",
    "title": "Human robot",
    "objective": "Write precise instructions without guessing.",
    "activity": "Draw a maze, write directions, then program a sprite to follow them.",
    "tool": "Scratch + paper",
    "module": 0
  },
  {
    "id": 3,
    "date": "2026-11-30",
    "title": "Binary switches",
    "objective": "Represent numbers 0\u201315 using four bits.",
    "activity": "Label four cards 8, 4, 2, 1; switch them on to encode a number.",
    "tool": "Scratch + cards",
    "module": 0
  },
  {
    "id": 4,
    "date": "2026-12-02",
    "title": "Tell a story",
    "objective": "Trigger a sequence with an event.",
    "activity": "Animate a welcome-back story with two keyboard controls.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 5,
    "date": "2026-12-07",
    "title": "Keep score",
    "objective": "Store input and update a variable.",
    "activity": "Ask a question and change a score or energy variable.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 6,
    "date": "2026-12-09",
    "title": "Choose your adventure",
    "objective": "Use a condition to choose an outcome.",
    "activity": "Build a story with two decisions and different endings.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 7,
    "date": "2026-12-14",
    "title": "Loop dance",
    "objective": "Replace repeated instructions with a loop.",
    "activity": "Build a repeating dance; compare it with duplicated blocks.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 8,
    "date": "2026-12-16",
    "title": "Custom blocks",
    "objective": "Name and reuse a group of instructions.",
    "activity": "Create a celebrate block; call it in two places.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 9,
    "date": "2026-12-21",
    "title": "Bug detectives",
    "objective": "Test one change at a time.",
    "activity": "Finish a small game with a variable, condition, and loop; log a bug.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 10,
    "date": "2026-12-23",
    "title": "Scratch studio",
    "objective": "Explain a program and use feedback.",
    "activity": "Exchange games, repair one bug, and save a backup.",
    "tool": "Scratch",
    "module": 0
  },
  {
    "id": 11,
    "date": "2027-01-04",
    "title": "Hello, Python",
    "objective": "Match familiar blocks to text instructions.",
    "activity": "Rebuild a greeting using print and input; compare it with Scratch.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 12,
    "date": "2027-01-06",
    "title": "Names and numbers",
    "objective": "Distinguish strings from numeric values.",
    "activity": "Build a nickname generator and an age-in-months calculator.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 13,
    "date": "2027-01-11",
    "title": "Decision maker",
    "objective": "Use if, elif, and else.",
    "activity": "Build an activity recommender with three outcomes.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 14,
    "date": "2027-01-13",
    "title": "Pattern printer",
    "objective": "Control repetition with range.",
    "activity": "Print a countdown and repeated patterns using a for loop.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 15,
    "date": "2027-01-20",
    "title": "Guess my number",
    "objective": "Stop a loop when its condition changes.",
    "activity": "Build a guessing game; test a low, high, and correct guess.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 16,
    "date": "2027-01-25",
    "title": "Function factory",
    "objective": "Define a function with an input.",
    "activity": "Write reusable quiz feedback functions and call each twice.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 17,
    "date": "2027-01-27",
    "title": "Text explorer",
    "objective": "Process characters in a string.",
    "activity": "Count vowels or create initials from fictional names.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 18,
    "date": "2027-02-01",
    "title": "Packing list",
    "objective": "Store and update multiple values.",
    "activity": "Create a three-item list; print and replace items using their indexes.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 19,
    "date": "2027-02-03",
    "title": "Brick builder",
    "objective": "Trace an inner and outer loop.",
    "activity": "Print a square of bricks; stretch: make a staircase.",
    "tool": "Python 3 + grid paper",
    "module": 1
  },
  {
    "id": 20,
    "date": "2027-02-08",
    "title": "Test everything",
    "objective": "Check normal, boundary, and unexpected input.",
    "activity": "Test your guessing game and add input checks with teacher support.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 21,
    "date": "2027-02-10",
    "title": "Quiz maker",
    "objective": "Combine input, decisions, loops, and functions.",
    "activity": "Complete a three-question quiz and explain one design decision.",
    "tool": "Python 3",
    "module": 1
  },
  {
    "id": 22,
    "date": "2027-02-22",
    "title": "Search one by one",
    "objective": "Trace linear search.",
    "activity": "Find a fictional member in cards, then write a list search.",
    "tool": "Python 3 + cards",
    "module": 2
  },
  {
    "id": 23,
    "date": "2027-02-24",
    "title": "Half the problem",
    "objective": "Explain why binary search needs sorted data.",
    "activity": "Play guess-the-number; trace a prepared binary-search example.",
    "tool": "Python 3 + sorted cards",
    "module": 2
  },
  {
    "id": 24,
    "date": "2027-03-01",
    "title": "Sorting studio",
    "objective": "Trace one sorting strategy.",
    "activity": "Perform insertion sort with cards, then complete a code scaffold.",
    "tool": "Python 3 + cards",
    "module": 2
  },
  {
    "id": 25,
    "date": "2027-03-03",
    "title": "Algorithm race",
    "objective": "Compare algorithms using counted steps.",
    "activity": "Count comparisons for different list sizes and graph your results.",
    "tool": "Python 3 + spreadsheet",
    "module": 2
  },
  {
    "id": 26,
    "date": "2027-03-08",
    "title": "Memory boxes",
    "objective": "Distinguish a stored value from its location.",
    "activity": "Label memory boxes; step through code while tracking variables.",
    "tool": "Python 3 + paper",
    "module": 2
  },
  {
    "id": 27,
    "date": "2027-03-10",
    "title": "Pixel artist",
    "objective": "Represent an image with a grid of values.",
    "activity": "Create and decode an 8 by 8 icon; save its editable source.",
    "tool": "Scratch + grid paper",
    "module": 2
  },
  {
    "id": 28,
    "date": "2027-03-15",
    "title": "Equipment lookup",
    "objective": "Associate keys with values.",
    "activity": "Build a dictionary of fictional equipment and quantities.",
    "tool": "Python 3",
    "module": 2
  },
  {
    "id": 29,
    "date": "2027-03-17",
    "title": "Stacks and queues",
    "objective": "Compare last-in-first-out and first-in-first-out.",
    "activity": "Model undo and a service queue; simulate one using a list.",
    "tool": "Python 3 + cards",
    "module": 2
  },
  {
    "id": 30,
    "date": "2027-03-22",
    "title": "Build a finder",
    "objective": "Choose a data structure and search method.",
    "activity": "Build an equipment finder with a not-found response.",
    "tool": "Python 3",
    "module": 2
  },
  {
    "id": 31,
    "date": "2027-03-24",
    "title": "Data lab review",
    "objective": "Explain and test a data project.",
    "activity": "Peer-test the finder; stretch: save a calculation to reuse later.",
    "tool": "Python 3",
    "module": 2
  },
  {
    "id": 32,
    "date": "2027-03-29",
    "title": "How the web works",
    "objective": "Describe a request and response.",
    "activity": "Deliver paper packets; label browser, network, and server.",
    "tool": "Browser + envelopes",
    "module": 3
  },
  {
    "id": 33,
    "date": "2027-03-31",
    "title": "My first page",
    "objective": "Structure content with HTML.",
    "activity": "Make a local club page using headings, paragraphs, and lists.",
    "tool": "Text editor + browser",
    "module": 3
  },
  {
    "id": 34,
    "date": "2027-04-05",
    "title": "Style studio",
    "objective": "Separate content from presentation.",
    "activity": "Add a CSS file with readable colors, spacing, and typography.",
    "tool": "Text editor + browser",
    "module": 3
  },
  {
    "id": 35,
    "date": "2027-04-07",
    "title": "Build for everyone",
    "objective": "Make a page easier to navigate.",
    "activity": "Add descriptive links, image alt text, and a second page.",
    "tool": "Text editor + browser",
    "module": 3
  },
  {
    "id": 36,
    "date": "2027-04-12",
    "title": "Make it interactive",
    "objective": "Connect an event to a visible response.",
    "activity": "Modify a supplied button to reveal a fact or change a theme.",
    "tool": "Text editor + browser",
    "module": 3
  },
  {
    "id": 37,
    "date": "2027-04-14",
    "title": "Friendly forms",
    "objective": "Give feedback when input is missing.",
    "activity": "Build a local nickname/activity form without sending data anywhere.",
    "tool": "Text editor + browser",
    "module": 3
  },
  {
    "id": 38,
    "date": "2027-04-19",
    "title": "Data detectives",
    "objective": "Relate table rows to a query.",
    "activity": "Use SELECT and WHERE on fictional club inventory.",
    "tool": "Teacher-prepared SQLite exercise",
    "module": 3
  },
  {
    "id": 39,
    "date": "2027-04-21",
    "title": "Ask better questions",
    "objective": "Filter, order, and summarize records.",
    "activity": "Solve an inventory mystery using ORDER BY; stretch: COUNT.",
    "tool": "Teacher-prepared SQLite exercise",
    "module": 3
  },
  {
    "id": 40,
    "date": "2027-05-03",
    "title": "Choose your mission",
    "objective": "Define an achievable project and audience.",
    "activity": "Choose a Scratch game, Python tool, or interactive site; outline three features.",
    "tool": "Scratch, Python, or web editor",
    "module": 4
  },
  {
    "id": 41,
    "date": "2027-05-05",
    "title": "Make a plan",
    "objective": "Break a project into smaller tasks.",
    "activity": "Write pseudocode and a task board; build the first feature.",
    "tool": "Chosen project tool",
    "module": 4
  },
  {
    "id": 42,
    "date": "2027-05-10",
    "title": "Build the core",
    "objective": "Implement the main behavior.",
    "activity": "Build and test your central interaction with a partner.",
    "tool": "Chosen project tool",
    "module": 4
  },
  {
    "id": 43,
    "date": "2027-05-12",
    "title": "Add a feature",
    "objective": "Extend a program without breaking it.",
    "activity": "Implement a second feature; rerun your earlier tests.",
    "tool": "Chosen project tool",
    "module": 4
  },
  {
    "id": 44,
    "date": "2027-05-19",
    "title": "User testing",
    "objective": "Use observed problems to guide changes.",
    "activity": "Swap projects, log expected versus actual behavior, and fix a priority bug.",
    "tool": "Chosen project tool",
    "module": 4
  },
  {
    "id": 45,
    "date": "2027-05-24",
    "title": "Polish and explain",
    "objective": "Make a project understandable to others.",
    "activity": "Improve instructions, reset behavior, readability, and credits.",
    "tool": "Chosen project tool",
    "module": 4
  },
  {
    "id": 46,
    "date": "2027-05-26",
    "title": "Ready to share",
    "objective": "Produce a working version with tests.",
    "activity": "Save a backup and prepare a two-minute demonstration.",
    "tool": "Chosen project tool",
    "module": 4
  },
  {
    "id": 47,
    "date": "2027-06-02",
    "title": "Catch-up lab",
    "objective": "Close an individual learning gap.",
    "activity": "Repair unfinished work or repeat the baseline challenge independently.",
    "tool": "Chosen project tool",
    "module": 5
  },
  {
    "id": 48,
    "date": "2027-06-07",
    "title": "Dress rehearsal",
    "objective": "Demonstrate reliably and explain a challenge.",
    "activity": "Rehearse your presentation and capture backup screenshots.",
    "tool": "Project + projector",
    "module": 5
  },
  {
    "id": 49,
    "date": "2027-06-09",
    "title": "Project celebration",
    "objective": "Explain a solution and personal growth.",
    "activity": "Present your work, try classmates\u2019 projects, and write a reflection.",
    "tool": "Project stations",
    "module": 5
  }
];
