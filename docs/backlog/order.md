# Backlog order of Agent M

**REGISTER**

The order in which the Product Owner wants the backlog's items worked on: dependency first, then value — level 1 (browser and hosted CI) end to end before level 2 (the Agent M Bridge, IMAP mail). One item per line, by its identifier; an item file this list does not name is appended at the bottom (MOD-work-items `backlogOrder`). No state is kept here: whether an item is waiting for acceptance, ready, in progress, blocked or done is derived from the approval records, job records and pull requests (UC-032).

## Order

1. ITM-001
2. ITM-002
3. ITM-003
4. ITM-004
5. ITM-005
6. ITM-006
7. ITM-007
8. ITM-124
9. ITM-008
10. ITM-123
11. ITM-009
12. ITM-010
13. ITM-011
14. ITM-012
15. ITM-013
16. ITM-014
17. ITM-015
18. ITM-016
19. ITM-018
20. ITM-019
21. ITM-020
22. ITM-021
23. ITM-022
24. ITM-023
25. ITM-024
26. ITM-026
27. ITM-027
28. ITM-028
29. ITM-029
30. ITM-030
31. ITM-031
32. ITM-032
33. ITM-033
34. ITM-034
35. ITM-035
36. ITM-036
37. ITM-037
38. ITM-038
39. ITM-039
40. ITM-040
41. ITM-050
42. ITM-052
43. ITM-063
44. ITM-081
45. ITM-082
46. ITM-083
47. ITM-084
48. ITM-087
49. ITM-046
50. ITM-041
51. ITM-042
52. ITM-044
53. ITM-047
54. ITM-048
55. ITM-043
56. ITM-045
57. ITM-051
58. ITM-054
59. ITM-055
60. ITM-085
61. ITM-056
62. ITM-057
63. ITM-058
64. ITM-059
65. ITM-073
66. ITM-074
67. ITM-075
68. ITM-076
69. ITM-077
70. ITM-093
71. ITM-094
72. ITM-095
73. ITM-060
74. ITM-017
75. ITM-049
76. ITM-061
77. ITM-086
78. ITM-092
79. ITM-062
80. ITM-078
81. ITM-079
82. ITM-089
83. ITM-090
84. ITM-091
85. ITM-114
86. ITM-115
87. ITM-064
88. ITM-080
89. ITM-088
90. ITM-098
91. ITM-065
92. ITM-112
93. ITM-066
94. ITM-067
95. ITM-068
96. ITM-025
97. ITM-069
98. ITM-070
99. ITM-071
100. ITM-072
101. ITM-096
102. ITM-097
103. ITM-113
104. ITM-116
105. ITM-125
106. ITM-126
107. ITM-127
108. ITM-128
109. ITM-129
110. ITM-130
111. ITM-131
112. ITM-132
113. ITM-133
114. ITM-134
115. ITM-135
116. ITM-136
117. ITM-137
118. ITM-138
119. ITM-139
120. ITM-140
121. ITM-099
122. ITM-100
123. ITM-101
124. ITM-102
125. ITM-103
126. ITM-104
127. ITM-105
128. ITM-106
129. ITM-053
130. ITM-107
131. ITM-108
132. ITM-117
133. ITM-118
134. ITM-109
135. ITM-110
136. ITM-111
137. ITM-119
138. ITM-120
139. ITM-121
140. ITM-122

## Conventions the items rely on

- **Code of a module** lives in `docs/assets/<module-slug>.mjs` and, where a later item adds a concern, in `docs/assets/<module-slug>/<concern>.mjs`; every file names its one module in a `Module:` line among its first 20 lines (ARC-020 decision 1). The dashboard's views are `docs/assets/dashboard/<view>-view.mjs` and its settings sections `docs/assets/dashboard/settings/<section>.mjs`, loaded by name (ITM-003). The CI entry is `tools/ci-entry.mjs` with one file per step in `tools/ci-entry/`; the bridge app is `bridge/`.
- **Job definitions** are folders `docs/assets/jobs/<kind>/` (ARC-007); the finding catalogue `docs/assets/jobs/findings.json` is written once, by ITM-023.
- **Tests** the SPEC names keep the path the SPEC gives. A check the SPEC names as `tests/review-core.test.mjs` is added as a file of `tests/review-core.d/` (ITM-004). Other tests of an item are files of its own.
- **Two items without a dependency between them change disjoint files**, so that teams work on them side by side on separate branches; where two items must change the same file, the later one depends on the earlier.
- **No item names a requirement or use case that is not accepted**; an item that will has to wait for acceptance (`NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED`).
