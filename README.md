# vueJsQuestionare
Dynamically dependent questionare.

#Dependency type - single/multiple
#for dependency type "multiple"--> conditional joins can be used. e.g.
#dependency_join = [{q1:ans1, q2:ans2}, {q3:ans3, q4:ans4}]
#1-The question will be rendered if either of the object in dependency_join satifies. (OR JOIN)
#2- For an object to satisfy e.g. dependency[0] (i.e. {q:ans1, q2:ans2}) all its property should be true.. (AND JOIN)

#Dynamic report is generated which specifies the reason of displaying a dependent question.

#NOTE->
If this is not working with chrome properly, please check for file read permission or use firefox browser