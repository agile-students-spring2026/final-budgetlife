# Guide to Contributing

Delete the contents of this file and replace with the contents of a proper guide to contributing to this project, as described in the [project setup instructions](./instructions-0c-project-setup.md).

## Team Norms

### Resolving Conflict
1. The team will first try to address the issue with the problematic teammate immediately... a best effort will be made to get in touch with the problematic member, let them know that they are creating a problem for the rest, and resolve the issue internally.

2. If the situation is not resolved before the next standup meeting, the team agrees that...

    a) this will be reported to the project management (i.e. admins); 

    b) other teammates will take over the problematic teammates responsibilities; 

    c) a best effort will be made to keep the problematic teammate informed of what is going on in the project by posting regular standup notes and other updates to Discord.

    d) if the problematic teammate attempts to become more involved with the project at a later date, the team will make a best effort to help him/her do so.

    e) in no case will the team sit around and wait more than 2 standup meetings for a non-participating teammate to complete his/her tasks.

### Sprint Length
2 weeks

### Daily Standups
Meet every 2-3 days at an agreed time in the evening for around 10 minutes. Members will not cover for other members who do not participate. A member who makes no progress on a task for two standups or more in a row will be reported to management.

### Coding Standards
1. Designate a code editor and code linter all team members will use to standardize code formatting (Visual Studio Code).
2. Don't over-engineer. Write minimum code to get things working end to end, only then iterate to improve. - Code for each task and spike must be peer-reviewed and pass tests before merging into the main/master branch of code.
3. Always push working code, if you break the pipeline/build then fix it.
4. Make granular and small commits, per feature or per bug fix.
5. Provide descriptive commit messages.
6. Write self documenting code. Use descriptive variable and function names. Avoid unnecessary name shortening.
7. Don't leave dead/commented out code behind. If you see such code, delete it.
8. Write automated tests to cover critical integration points and functionality.

## Git Workflow

<!-- Fill in: describe the Git workflow your team follows (e.g. feature branch workflow). All changes in branches, peer review via pull requests, merge into `main`. -->

We use a feature-branch workflow. The main branch is always stable and deployable (or at least “runs without breaking the app”). All work happens in branches, reviewed via pull requests, then merged into main.

### Branches
- main: protected branch. No direct pushes.
- feature/<short-description>: new features (ex: feature/budget-category-buildings)
- fix/<short-description>: bug fixes (ex: fix/login-redirect)
- chore/<short-description>: tooling/refactors/docs (ex: chore/update-lint-rules)

### Daily flow
1. git checkout main
2. git pull origin main
3. Create a branch: git checkout -b feature/...
4. Make small commits as you work, don’t save everything for one giant commit.
5. Push branch: git push -u origin <branch>
6. Open a PR into main and request at least 1 reviewer (2 if it’s a big change).

### PR requirements
- PR title describes the change clearly.
- PR description includes what changed + why.

## Rules of Contributing

<!-- Fill in: detailed rules for how and what to contribute, considerations, and any conventions -->
1. Keep main clean
- No direct commits to main. 
- Don’t merge broken code. 
- If a feature is incomplete, keep it on a branch.
2. Scope rules 
- One PR should do one thing (feature OR fix OR refactor). 
- If a PR touches multiple areas (frontend + backend + DB), explain the coupling in the PR description.
3. Code style / formatting
- Follow the repo’s formatter/linter. 
4. Naming + organization
- Use clear names: city, building, category, transaction, budget, monthSummary.
- Keep UI components reusable.
5. Commit message convention
- Use short, consistent commit messages like: "feat: add building upgrade logic."
6. Definition of Done
- A PR is “done” when: The feature works end-to-end for its scope, no obvious UI regressions.

## Setting Up the Local Development Environment

<!-- Fill in: step-by-step instructions so contributors can run the project locally -->

_TBD_

## Building and Testing

<!-- Fill in: once the project reaches that stage, add instructions for building and running tests -->

_TBD_
