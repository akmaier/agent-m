---
id: UC-047
title: Be told what waits for your acceptance
area: overview
actors:
  - Person
  - Browser
  - Repository servers
realises:
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
  - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
  - STATUS IS DERIVED FROM THE RECORDS
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - CONFIGURATION LIVES IN THE BROWSER
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - EVERY STEP EXPLAINS ITSELF
  - NO SERVER
---
# UC-047 Be told what waits for your acceptance

**Goal.** The person learns that a SPEC change, a use case, an architecture file or a release test report waits for their
acceptance as soon as it does, without looking for it — and one click takes them to where they accept it.

## Actors

- **Person** — the single user of the instance, who accepts what its participants draft.
- **Browser** — shows the notifications, once the person has allowed it to.
- **Repository servers** — GitHub and GitLab; they answer the checks of the instance and its products.

## Precondition

- The person has their instance's dashboard, with its token stored in this browser (UC-014).

## Main flow

1. On the settings page, in the section *this browser* (UC-042), the line **Notifications** says *off*. The person presses
   **Switch on**. The browser asks its own question — allow notifications from this site? —, and the person allows them. The
   line says *on*, with **Test**, which shows a notification at once, and **Switch off**.
2. While a page of the dashboard is open in this browser — in front or in the background —, the dashboard checks every five
   minutes what waits for the person's acceptance in the instance and in each product this browser keeps: open SPEC change
   entries, open use cases, open architecture files — decisions and modules —, and every release test report that waits for
   **Accept and release** because its release candidate's complete run has ended (UC-013). It derives them as the main page
   derives what waits (UC-046, step 5), from the files and the records, and with the token of each.
3. For each of them that has come to wait since the last check, the browser shows a notification that names it and where it
   is — *UC-047 waits for your acceptance · akmaier/agent-m* —; a click on it opens the page where it is accepted: its review
   page, for the product it is in or for the instance itself, which the product selector offers beside the products; for a
   release test report, the release panel (UC-013). When more than three of one kind come at once in one repository, one
   notification names their number instead — *4 use cases wait for your acceptance · akmaier/agent-m* — and a click opens the
   list of that kind on the review pages, where they are accepted one by one or together: every notification leads to where
   what it names is accepted (`A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`). The first check after **Switch on** tells
   nothing and takes what waits then as known: a notification tells what comes to wait while notifications are on (`A PERSON
   IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`).
4. What was notified is kept in this browser, by file and text: nothing is notified twice while it waits; a file changed
   again comes to wait anew.

The line carries a folded **What is this?**: what is checked and how often, that the checks go to the repository servers
with the tokens of this browser and nowhere else, and that nothing is checked while no page of the dashboard is open.

```mermaid
sequenceDiagram
    actor P as Person
    participant D as Dashboard (any page)
    participant B as Browser
    participant S as Repository servers
    P->>D: Settings, Notifications, Switch on
    D->>B: ask the permission to notify
    B-->>P: allow notifications?
    P->>B: allow
    loop every five minutes, while a page is open
        D->>S: read the instance and each product (their tokens)
        D->>D: what waits for acceptance, against what was notified
        D->>B: a notification per file come to wait, or per kind and repository for more than three
    end
    P->>B: click the notification
    B->>D: open the page where it is accepted
```

## Alternative flows

- **1a. The person, or the browser, refuses.** The line says that notifications are blocked for this site, and where the
  browser's own site settings allow them; nothing is notified.
- **1b. On an iPhone or an iPad.** Safari shows notifications only for a site added to the Home Screen; the line says so and
  how to add it, and *Switch on* works from the dashboard opened there.
- **2a. No page of the dashboard is open.** Nothing is checked and nothing is notified: Agent M runs no server that could. At
  the next check after a page is opened, what came to wait meanwhile is notified as in step 3.
- **2b. The browser pauses a page in the background** to save power, as some do; the check runs when it runs the page again.
- **2c. A server's request limit is used up, or a server cannot be reached.** That check skips it and the next one tries
  again; nothing is notified for it in between.
- **3a. The browser does not pass the click on to the dashboard.** Where a browser opens the dashboard on a click without
  handing the click to it — whether Safari does so on an iPhone or an iPad is measured before release (`BROWSER REACHABILITY IS
  MEASURED, NOT ASSUMED`) —, the dashboard opens where the browser opens it, and the notification's text, what waits and
  where, leads the person to it.
- **4a. The person switches notifications off.** The checks stop at once, and what was notified is forgotten. The browser
  keeps its permission until the person takes it back in the browser's settings; the line says so. Switched on again, the
  notifications begin as in step 3: what waits then is taken as known.

## Postcondition

- While a page of the dashboard was open, the person was notified once of everything that came to wait for their acceptance
  after notifications were switched on, each notification with a link to where what it names is accepted — or, where the
  browser does not pass the click on (3a), with what waits and where.
- Nothing was written to any repository and no server of Agent M's own was used; the notifications were shown by this browser.
