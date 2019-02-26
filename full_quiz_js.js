// const quizData = 'https://api.myjson.com/bins/ahn1p';
const quizData1 = 'question_list_org.json'
//  Global event instance
const app = new Vue({
  el:'#quiz',
  data: {
      dependent_questions:[{id:1, text:'how are you?', dependency:[1, 't'], watch:false}],
      introStage:false,
      questionStage:false,
      resultsStage:false,
      title:'',
      questions:[],
      currentQuestion:0,
      answers:[],
      correct:0,
      perc:null,
      cur_resp: [null, null],
      all_responses: [],
      json_response:{},
      cardStyle: {'transition':'0.3s'}
  },
  created() {
    fetch(quizData1)
    .then(res => res.json())
    .then(res => {
      this.title = res.title;
      this.questions = res.questions; 
      this.introStage = true;
    }); // generator.js me aaja
    Event.$on('answer', (data)=> this.addquestionHandler(data));
    Event.$on('delete', (que_id)=> this.deleteResponseHandler(que_id));

  },
  methods:{
    startQuiz() {
      this.introStage = false;
      this.questionStage = true;
      console.log('test'+JSON.stringify(this.questions[this.currentQuestion]));
    },
    getQuestion(id){
      return this.questions.find(obj => (obj.id==id));
    },
    recordAnswer(queId, ans){
      que = this.getQuestion(queId);
      this.$set(que, "answer", ans);
    },
    handleAnswer(e) {
      console.log('answer event ftw',e);
      if (e.answer){
        this.answers[this.currentQuestion]=e.answer;
      }
      else{
        this.answers[this.currentQuestion]= e.mcanswer;
      }
      if((this.currentQuestion+1) === this.questions.length) {
        this.handleResults();
        this.questionStage = false;
        this.resultsStage = true;
      } else {
        this.currentQuestion++;
      }
    },
    deleteResponseHandler(que) {
      // this.$set(this.json_response, data.q, data.ans);
      // this.all_responses.push([data.q, data.ans]);
      this.recordAnswer(que, "");
      Vue.delete(this.json_response, que);
    },
    addquestionHandler(data){
      this.recordAnswer(data.q, data.ans);
      this.$set(this.json_response, data.q, data.ans);
    },
    updateHoverState(cardType, isHover){
      var questionCard = document.getElementById('questionCard')
      var reportCard = document.getElementById("reportCard")
      if(cardType=="reportCard"){
        reportCard.className = "card col-lg-9 col-md-8 col-sm-8";
        questionCard.className = "card col-lg-3 col-md-2 col-sm-2"
      }
      else{
        questionCard.className = "card col-lg-9 col-md-8 col-sm-8";
        reportCard.className = "card col-lg-3 col-md-2 col-sm-2"
      }
    }
  },
})
