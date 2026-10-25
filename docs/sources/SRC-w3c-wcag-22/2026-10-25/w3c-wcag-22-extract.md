# WCAG 2.2 — Web Content Accessibility Guidelines — extract

Source: https://www.w3.org/TR/2024/REC-WCAG22-20241212/

The Recommendation of 12 December 2024.

Original file: `REC-WCAG22-20241212.html`, SHA-256 `6e3c5fe397257cae509a2fb4752b73062cf8cbeb92c2cec618989b17e4cf7057`, not stored here.

Copyright © 2020-2024 World Wide Web Consortium. W3C® liability, trademark and document use rules apply (https://www.w3.org/copyright/document-license-2023/). Portions of the Recommendation, copied without change of their content; the original is at the link above.

Parts kept: Success criteria of level A and AA. Everything else of the text is left out. The wording of the parts is the original's; line breaks and markup are normalised, and tables and footnotes of the original are not carried over.

---

### 1.1.1 Non-text Content (Level A)

All non-text content that is presented to the user has a text alternative that serves the equivalent purpose, except for the situations listed below.
**Controls, Input**: If non-text content is a control or accepts user input, then it has a name that describes its purpose. (Refer to Success Criterion 4.1.2 for additional requirements for controls and content that accepts user input.)
**Time-Based Media**: If non-text content is time-based media, then text alternatives at least provide descriptive identification of the non-text content. (Refer to Guideline 1.2 for additional requirements for media.)
**Test**: If non-text content is a test or exercise that would be invalid if presented in text, then text alternatives at least provide descriptive identification of the non-text content.
**Sensory**: If non-text content is primarily intended to create a specific sensory experience, then text alternatives at least provide descriptive identification of the non-text content.
**CAPTCHA**: If the purpose of non-text content is to confirm that content is being accessed by a person rather than a computer, then text alternatives that identify and describe the purpose of the non-text content are provided, and alternative forms of CAPTCHA using output modes for different types of sensory perception are provided to accommodate different disabilities.
**Decoration, Formatting, Invisible**: If non-text content is pure decoration, is used only for visual formatting, or is not presented to users, then it is implemented in a way that it can be ignored by assistive technology.

### 1.2.1 Audio-only and Video-only (Prerecorded) (Level A)

For prerecorded audio-only and prerecorded video-only media, the following are true, except when the audio or video is a media alternative for text and is clearly labeled as such:
**Prerecorded Audio-only**: An alternative for time-based media is provided that presents equivalent information for prerecorded audio-only content.
**Prerecorded Video-only**: Either an alternative for time-based media or an audio track is provided that presents equivalent information for prerecorded video-only content.

### 1.2.2 Captions (Prerecorded) (Level A)

Captions are provided for all prerecorded audio content in synchronized media, except when the media is a media alternative for text and is clearly labeled as such.

### 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A)

An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media, except when the media is a media alternative for text and is clearly labeled as such.

### 1.2.4 Captions (Live) (Level AA)

Captions are provided for all live audio content in synchronized media.

### 1.2.5 Audio Description (Prerecorded) (Level AA)

Audio description is provided for all prerecorded video content in synchronized media.

### 1.3.1 Info and Relationships (Level A)

Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.

### 1.3.2 Meaningful Sequence (Level A)

When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.

### 1.3.3 Sensory Characteristics (Level A)

Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, color, size, visual location, orientation, or sound.

### 1.3.4 Orientation (Level AA)

Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific display orientation is essential.

### 1.3.5 Identify Input Purpose (Level AA)

The purpose of each input field collecting information about the user can be programmatically determined when:
The input field serves a purpose identified in the Input Purposes for user interface components section; and
The content is implemented using technologies with support for identifying the expected meaning for form input data.

### 1.4.1 Use of Color (Level A)

Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

### 1.4.2 Audio Control (Level A)

If any audio on a web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.

### 1.4.3 Contrast (Minimum) (Level AA)

The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for the following:
**Large Text**: Large-scale text and images of large-scale text have a contrast ratio of at least 3:1;
**Incidental**: Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement.
**Logotypes**: Text that is part of a logo or brand name has no contrast requirement.

### 1.4.4 Resize Text (Level AA)

Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.

### 1.4.5 Images of Text (Level AA)

If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text except for the following:
**Customizable**: The image of text can be visually customized to the user's requirements;
**Essential**: A particular presentation of text is essential to the information being conveyed.

### 1.4.10 Reflow (Level AA)

Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for:
Vertical scrolling content at a width equivalent to 320 CSS pixels;
Horizontal scrolling content at a height equivalent to 256 CSS pixels.
Except for parts of the content which require two-dimensional layout for usage or meaning.

### 1.4.11 Non-text Contrast (Level AA)

The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s):
**User Interface Components**: Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author;
**Graphical Objects**: Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed.

### 1.4.12 Text Spacing (Level AA)

In content implemented using markup languages that support the following text style properties, no loss of content or functionality occurs by setting all of the following and by changing no other style property:
Line height (line spacing) to at least 1.5 times the font size;
Spacing following paragraphs to at least 2 times the font size;
Letter spacing (tracking) to at least 0.12 times the font size;
Word spacing to at least 0.16 times the font size.
Exception: Human languages and scripts that do not make use of one or more of these text style properties in written text can conform using only the properties that exist for that combination of language and script.

### 1.4.13 Content on Hover or Focus (Level AA)

Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true:
**Dismissible**: A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus, unless the additional content communicates an input error or does not obscure or replace other content;
**Hoverable**: If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing;
**Persistent**: The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid.
Exception: The visual presentation of the additional content is controlled by the user agent and is not modified by the author.

### 2.1.1 Keyboard (Level A)

All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints.

### 2.1.2 No Keyboard Trap (Level A)

If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away.

### 2.1.4 Character Key Shortcuts (Level A)

If a keyboard shortcut is implemented in content using only letter (including upper- and lower-case letters), punctuation, number, or symbol characters, then at least one of the following is true:
**Turn off**: A mechanism is available to turn the shortcut off;
**Remap**: A mechanism is available to remap the shortcut to include one or more non-printable keyboard keys (e.g., Ctrl, Alt);
**Active only on focus**: The keyboard shortcut for a user interface component is only active when that component has focus.

### 2.2.1 Timing Adjustable (Level A)

For each time limit that is set by the content, at least one of the following is true:
**Turn off**: The user is allowed to turn off the time limit before encountering it; or
**Adjust**: The user is allowed to adjust the time limit before encountering it over a wide range that is at least ten times the length of the default setting; or
**Extend**: The user is warned before time expires and given at least 20 seconds to extend the time limit with a simple action (for example, "press the space bar"), and the user is allowed to extend the time limit at least ten times; or
**Real-time Exception**: The time limit is a required part of a real-time event (for example, an auction), and no alternative to the time limit is possible; or
**Essential Exception**: The time limit is essential and extending it would invalidate the activity; or
**20 Hour Exception**: The time limit is longer than 20 hours.

### 2.2.2 Pause, Stop, Hide (Level A)

For moving, blinking, scrolling, or auto-updating information, all of the following are true:
**Moving, blinking, scrolling**: For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential; and
**Auto-updating**: For any auto-updating information that (1) starts automatically and (2) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless the auto-updating is part of an activity where it is essential.

### 2.3.1 Three Flashes or Below Threshold (Level A)

Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.

### 2.4.1 Bypass Blocks (Level A)

A mechanism is available to bypass blocks of content that are repeated on multiple web pages.

### 2.4.2 Page Titled (Level A)

Web pages have titles that describe topic or purpose.

### 2.4.3 Focus Order (Level A)

If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.

### 2.4.4 Link Purpose (In Context) (Level A)

The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context, except where the purpose of the link would be ambiguous to users in general.

### 2.4.5 Multiple Ways (Level AA)

More than one way is available to locate a web page within a set of web pages except where the web page is the result of, or a step in, a process.

### 2.4.6 Headings and Labels (Level AA)

Headings and labels describe topic or purpose.

### 2.4.7 Focus Visible (Level AA)

Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.

### 2.4.11 Focus Not Obscured (Minimum) (Level AA)

New
When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.

### 2.5.1 Pointer Gestures (Level A)

All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential.

### 2.5.2 Pointer Cancellation (Level A)

For functionality that can be operated using a single pointer, at least one of the following is true:
**No Down-Event**: The down-event of the pointer is not used to execute any part of the function;
**Abort or Undo**: Completion of the function is on the up-event, and a mechanism is available to abort the function before completion or to undo the function after completion;
**Up Reversal**: The up-event reverses any outcome of the preceding down-event;
**Essential**: Completing the function on the down-event is essential.

### 2.5.3 Label in Name (Level A)

For user interface components with labels that include text or images of text, the name contains the text that is presented visually.

### 2.5.4 Motion Actuation (Level A)

Functionality that can be operated by device motion or user motion can also be operated by user interface components and responding to the motion can be disabled to prevent accidental actuation, except when:
**Supported Interface**: The motion is used to operate functionality through an accessibility supported interface;
**Essential**: The motion is essential for the function and doing so would invalidate the activity.

### 2.5.7 Dragging Movements (Level AA)

New
All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author.

### 2.5.8 Target Size (Minimum) (Level AA)

New
The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:
**Spacing**: Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target;
**Equivalent**: The function can be achieved through a different control on the same page that meets this criterion;
**Inline**: The target is in a sentence or its size is otherwise constrained by the line-height of non-target text;
**User Agent Control**: The size of the target is determined by the user agent and is not modified by the author;
**Essential**: A particular presentation of the target is essential or is legally required for the information being conveyed.

### 3.1.1 Language of Page (Level A)

The default human language of each web page can be programmatically determined.

### 3.1.2 Language of Parts (Level AA)

The human language of each passage or phrase in the content can be programmatically determined except for proper names, technical terms, words of indeterminate language, and words or phrases that have become part of the vernacular of the immediately surrounding text.

### 3.2.1 On Focus (Level A)

When any user interface component receives focus, it does not initiate a change of context.

### 3.2.2 On Input (Level A)

Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.

### 3.2.3 Consistent Navigation (Level AA)

Navigational mechanisms that are repeated on multiple web pages within a set of web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user.

### 3.2.4 Consistent Identification (Level AA)

Components that have the same functionality within a set of web pages are identified consistently.

### 3.2.6 Consistent Help (Level A)

New
If a web page contains any of the following help mechanisms, and those mechanisms are repeated on multiple web pages within a set of web pages, they occur in the same order relative to other page content, unless a change is initiated by the user:
Human contact details;
Human contact mechanism;
Self-help option;
A fully automated contact mechanism.

### 3.3.1 Error Identification (Level A)

If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.

### 3.3.2 Labels or Instructions (Level A)

Labels or instructions are provided when content requires user input.

### 3.3.3 Error Suggestion (Level AA)

If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.

### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

For web pages that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, at least one of the following is true:
**Reversible**: Submissions are reversible.
**Checked**: Data entered by the user is checked for input errors and the user is provided an opportunity to correct them.
**Confirmed**: A mechanism is available for reviewing, confirming, and correcting information before finalizing the submission.

### 3.3.7 Redundant Entry (Level A)

New
Information previously entered by or provided to the user that is required to be entered again in the same process is either:
auto-populated, or
available for the user to select.
Except when:
re-entering the information is essential,
the information is required to ensure the security of the content, or
previously entered information is no longer valid.

### 3.3.8 Accessible Authentication (Minimum) (Level AA)

New
A cognitive function test (such as remembering a password or solving a puzzle) is not required for any step in an authentication process unless that step provides at least one of the following:
**Alternative**: Another authentication method that does not rely on a cognitive function test.
**Mechanism**: A mechanism is available to assist the user in completing the cognitive function test.
**Object Recognition**: The cognitive function test is to recognize objects.
**Personal Content**: The cognitive function test is to identify non-text content the user provided to the website.

### 4.1.2 Name, Role, Value (Level A)

For all user interface components (including but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.

### 4.1.3 Status Messages (Level AA)

In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.
