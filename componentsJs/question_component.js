window.Event = new Vue();

var checkBoxRequireMixin = {
  methods: {
    checkBoxRequirement: function (checkedNames, isRequired) {
      // console.log(isRequired, checkedNames.length)
      if (checkedNames.length>0){
        return false;
      }
      return isRequired=="True"? true: false;
  }
}
};
Vue.component('question-list', {
  props: ['questions', 'json_response'],
  template: `
  <div>
    <div v-for="(que, index) in filteredQuestions">
      <question
      class = "mx-0"
      :question="que"
      :question_id="que.id"
      :question_number="index+1"></question>
      <dependent-list :question_list="single_dependent_questions(que)" :parent_qno="index+1"></dependent-list>
    </div>
  </div>
  `,
  data(){
    return {
      cur_que:'',
    }
  },
  computed:{
    filteredQuestions: function(){
      // return this.questions.filter(que=>(que.show && que.dependency_type != "single"));
      return this.multiple_dependent_questions(this.questions)
    }
  },
  watch:{
    cur_que:function(){
      this.single_dependent_questions(this.cur_que);
    }
  },
  created(){
    Event.$on('answer', (data)=> this.update(data)); // jb bhi question answer hoga to yha event catch krenge.. aur  update method call krenge
  },
  methods:{
    update: function(data){
      this.cur_que=data.q
      this.$set(this.json_response, data.q, data.ans); // to json response update hoga, wo to pta hai , ok leave it
      // this.multiple_dependent_questions(data); //  main logic pe aate hai
    },
    isSubset: function(small, big) {
      const satisfy = (aSubset, aSuperset) => (_.every(aSubset, (val, key) => _.isEqual(val, aSuperset[key])));
      return satisfy(small, big);
    },
    single_dependent_questions: function(parent){
      checkIfDependencySatisfied = this.checkIfDependencySatisfied
      json_response = this.json_response
      isSubset = this.isSubset
      const result = this.questions.filter( function(question){
        const dc_join = question.dependency_join.filter(function(dc){
          flag =false
          // console.log(parent.id in dc)
          if (parent.id in dc){
            flag = true
          }
          return flag;
        });
        if (dc_join.length!=0 && question.dependency_type=="single"){
          question.show = checkIfDependencySatisfied(question.dependency_join)
          if ((question.id in this.json_response && !question.show)){
            // Vue.delete(this.json_response, question.id)
            Event.$emit('delete', question.id);
          }
        }
        return question.dependency_type=="single" && (dc_join.length!=0)
      });
      return result;
    },
    checkIfDependencySatisfied: function(dependencies){
      let flag = null;
        // console.log('Array.isArray(dependencies)', Array.isArray(dependencies))
        if (Array.isArray(dependencies)) { // dependency is an array
          flag = false;
          // if dependency is array we recur on every element of dependency and take OR of them
          dependencies.forEach((dependency) => { // iterate over dependencies
            // flag &= checkIfDependencySatisfied(dependency); // to? smjha?? recursion h.. pr recursion trace kesa hoga
            flag =  flag || this.checkIfDependencySatisfied(dependency);
          });
        } else if (dependencies && typeof(dependencies) === 'object') {
          flag = true;
          // if dependency is object we recur on every element of dependency and take AND of them
          Object.entries(dependencies).forEach(([parentQuestion, expectedAnswer]) => { 
            // console.log('parentQuestion', parentQuestion, 'expectedAnswer', expectedAnswer)
            const userAnswer = this.json_response[parentQuestion];
            if (userAnswer){
              if (Array.isArray(expectedAnswer)) {
                flag = flag && (expectedAnswer.reduce((acc, answer) => acc && userAnswer.includes(answer), true));
              } else {
                flag = flag && (expectedAnswer === userAnswer);
              }
            }
            else{
              flag = false;
            }
          });
        } else {
          throw new Error('Invalid dependencies format.')
        }
        return flag;
      },
    multiple_dependent_questions: function(list){ //haan
      const result = list.filter(q => (q.dependency_type!="single")).filter((question) => {
        const dependencyJoin = question.dependency_join;
        if (question.dependency_type=="multiple"){
          question.show = this.checkIfDependencySatisfied(dependencyJoin);
          if ((question.id in this.json_response && !question.show)){
            // Vue.delete(this.json_response, question.id)
            question.show = this.checkIfDependencySatisfied(dependencyJoin);
            Event.$emit('delete', question.id)
          }
        }
        return question.show;
      });

      return result; 
      // console.log('result', Object.entries(result))
    },
  }
});

Vue.component('dependent-question',{
  props:['question','question_number', 'question_id', 'parent_qno'],
  mixins:[checkBoxRequireMixin],
  template:`
  <div class="mx-4">
    <p>{{question.text}}</p>
    <strong>Question {{ parent_qno }}.{{ question_number}}:</strong>
    <strong>{{ question.text }} </strong>

    <div v-if="question.answer_type === 'sc'">
      <span v-for="scanswer in question.answers">
        <input type="radio" :name="question_id" :id="question_number" v-model="answer" :value="scanswer" :required="question.isrequired=='True'"><label for="trueAnswer">{{scanswer}}</label>
      </span>
    </div>

    <div v-if="question.answer_type === 'mc'">
      <div v-for="(mcanswer,index) in question.answers">
        <input type="checkbox" :id="mcanswer" :value="mcanswer" v-model="checkedNames" v-bind:name="question_number" :required="checkBoxRequirement(checkedNames, question.isrequired)">
        <label :for="mcanswer">{{ mcanswer }}</label>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      answer:'',
      checkedNames: [],
      computed_test: {},
    }
 },
//  created(){
//    Event.$on('answer', (data)=> this.update(data));
//  },
 watch:{
    answer: function(){
      this.computed_test[this.question_number] = this.answer;
      Event.$emit('answer', {q:this.question_id, ans:this.answer});
    },
    checkedNames: function(){
      this.computed_test[this.question_number] = this.checkedNames;
      Event.$emit('answer', {q:this.question_id, ans:this.checkedNames});
    }
  }
})


Vue.component('dependent-list',{
  props:['question_list', 'parent_qno'],
  template:`
  <div>
    <div v-for="(que,index) in question_list" v-if="que.show">
    <dependent-question
    :question="que"
    :question_id="que.id"
    :parent_qno="parent_qno"
    :question_number="index+1"></dependent-question>
  </div>
    </div>
  </div>
  `,
  });

Vue.component('question', {
  template:`
  <div :class="cls">
    <strong>Question {{ question_number }}:</strong>
    <strong>{{ question.text }} </strong>

    <div v-if="question.answer_type === 'sc'">
      <span v-for="scanswer in question.answers">
        <input type="radio" :name="question_number" :id="question_number" v-model="answer" :value="scanswer" :required="question.isrequired=='True'"><label for="trueAnswer">{{scanswer}}</label>
      </span>
    </div>

    <div v-if="question.answer_type === 'mc'">
      <div v-for="(mcanswer,index) in question.answers">
        <input type="checkbox" :id="mcanswer" :value="mcanswer" v-model="checkedNames" v-bind:name="question_number" :required="checkBoxRequirement(checkedNames, question.isrequired)">
        <label :for="mcanswer">{{ mcanswer }}</label>
      </div>
    </div>
  </div>
  `,
    data() {
       return {
         answer:'',
         checkedNames: [],
         computed_test: {},
         json_response: {}
       }
    },
    created(){
      Event.$on('answer', (data)=> this.update(data));
    },
    props:['question','question_number', 'question_id', 'cls'],
    mixins:[checkBoxRequireMixin],
    methods:{
      submitAnswer:function() {
        Event.$emit('answer', {answer:this.computed_test});
        // this.$emit('answer', {answer:this.computed_test});
        this.answer = null;
        this.checkedNames = [];
      },
      display: function(arr) {
        if(this.json_response[arr[0]]==arr[1]){
          return true;
        }
      },
      update: function(data) {
        this.$set(this.json_response, data.q, data.ans);
      }
    },
    watch:{
      answer: function(){
        this.computed_test[this.question_number] = this.answer;
        Event.$emit('answer', {q:this.question_id, ans:this.answer});
      },
      checkedNames: function(){
        this.computed_test[this.question_number] = this.checkedNames;
        Event.$emit('answer', {q:this.question_id, ans:this.checkedNames});
      }
    }
});