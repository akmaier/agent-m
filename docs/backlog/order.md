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
8. ITM-008
9. ITM-123
10. ITM-009
11. ITM-010
12. ITM-011
13. ITM-012
14. ITM-013
15. ITM-014
16. ITM-015
17. ITM-016
18. ITM-018
19. ITM-019
20. ITM-020
21. ITM-021
22. ITM-022
23. ITM-023
24. ITM-024
25. ITM-026
26. ITM-027
27. ITM-028
28. ITM-029
29. ITM-030
30. ITM-031
31. ITM-032
32. ITM-033
33. ITM-034
34. ITM-035
35. ITM-036
36. ITM-037
37. ITM-038
38. ITM-039
39. ITM-040
40. ITM-050
41. ITM-052
42. ITM-063
43. ITM-081
44. ITM-082
45. ITM-083
46. ITM-084
47. ITM-087
48. ITM-046
49. ITM-041
50. ITM-042
51. ITM-044
52. ITM-047
53. ITM-048
54. ITM-043
55. ITM-045
56. ITM-051
57. ITM-054
58. ITM-055
59. ITM-085
60. ITM-056
61. ITM-057
62. ITM-058
63. ITM-059
64. ITM-073
65. ITM-074
66. ITM-075
67. ITM-076
68. ITM-077
69. ITM-093
70. ITM-094
71. ITM-095
72. ITM-060
73. ITM-017
74. ITM-049
75. ITM-061
76. ITM-086
77. ITM-092
78. ITM-062
79. ITM-078
80. ITM-079
81. ITM-089
82. ITM-090
83. ITM-091
84. ITM-114
85. ITM-115
86. ITM-064
87. ITM-080
88. ITM-088
89. ITM-098
90. ITM-065
91. ITM-112
92. ITM-066
93. ITM-067
94. ITM-068
95. ITM-025
96. ITM-069
97. ITM-070
98. ITM-071
99. ITM-072
100. ITM-096
101. ITM-097
102. ITM-113
103. ITM-116
104. ITM-099
105. ITM-100
106. ITM-101
107. ITM-102
108. ITM-103
109. ITM-104
110. ITM-105
111. ITM-106
112. ITM-053
113. ITM-107
114. ITM-108
115. ITM-117
116. ITM-118
117. ITM-109
118. ITM-110
119. ITM-111
120. ITM-119
121. ITM-120
122. ITM-121
123. ITM-122

## Conventions the items rely on

- **Code of a module** lives in `docs/assets/<module-slug>.mjs` and, where a later item adds a concern, in `docs/assets/<module-slug>/<concern>.mjs`; every file names its one module in a `Module:` line among its first 20 lines (ARC-020 decision 1). The dashboard's views are `docs/assets/dashboard/<view>-view.mjs` and its settings sections `docs/assets/dashboard/settings/<section>.mjs`, loaded by name (ITM-003). The CI entry is `tools/ci-entry.mjs` with one file per step in `tools/ci-entry/`; the bridge app is `bridge/`.
- **Job definitions** are folders `docs/assets/jobs/<kind>/` (ARC-007); the finding catalogue `docs/assets/jobs/findings.json` is written once, by ITM-023.
- **Tests** the SPEC names keep the path the SPEC gives. A check the SPEC names as `tests/review-core.test.mjs` is added as a file of `tests/review-core.d/` (ITM-004). Other tests of an item are files of its own.
- **Two items without a dependency between them change disjoint files**, so that teams work on them side by side on separate branches; where two items must change the same file, the later one depends on the earlier.
- **No item names a requirement or use case that is not accepted**; an item that will has to wait for acceptance (`NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED`).
