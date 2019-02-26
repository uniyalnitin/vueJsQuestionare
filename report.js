Vue.component('report', {
    props:['questions', 'json_response'],
    template:`
    <div>
        <ul v-for="response,queId of json_response_obj">
            <response-detail :response="response" :questions="questions" :json_response="json_response_obj" :queId="queId"></response-detail>
        </ul>
    </div>
    `,
    computed:{
        json_response_obj:function(){
            return this.json_response
        }
    }
});

Vue.component('response-detail',{
    props:['response', 'questions', 'json_response', 'queId'],
    template:`
    <li>
        <div v-if="dependency_type=='single'">
            <p>You have answered <b>{{text}}</b> as <b>{{answer}}</b><br>
            <i :style="reasonStyle">you are able to answer this question because you have answered <span :style="parentQuestionStyle">{{ parentQuestionString }}</span> as <span :style="parentAnswerStyle">{{ parentAnswerString }}</span></i></p>
        </div>
        <div v-else-if="dependency_type=='multiple'">
            <p>You have answered <b>{{text}}</b> as <b>{{answer}}</b><br>
            <i :style="reasonStyle">you are able to answer this question because you have answered <span :style="parentQuestionStyle">{{ parentQuestionString }}</span> as <span :style="parentAnswerStyle">{{ parentAnswerString }}</span> respectively</i></p>
        </div>

        <div v-else>
            <p>You have answered <b>{{text}}</b> as <b>{{ answer }}</b></p>
        </div>
    </li>
    `,
    data(){
        return {
            answered_que:'',
            id : '',
            text: '',
            answer_type: '',
            dependency_type:'',
            dependency_join:'',
            answers:'',
            isrequired:'',
            answer:'',
            parent_questions:[], 
            dependency_msg:'',
            reasonStyle:{'color':'red'},
            parentQuestionStyle:{'color':'blue'},
            parentAnswerStyle:{'color': 'brown'},
            parentQuestionString: '',
            parentAnswerString:'',
        }
    },
    created(){
        var cur_que = this.getQuestion(this.queId)
        this.id = cur_que.id;
        this.text= cur_que.text;
        this.answer_type= cur_que.answer_type;
        this.dependency_type = cur_que.dependency_type;
        this.dependency_join =cur_que.dependency_join;
        this.answers =cur_que.answers;
        this.isrequired=cur_que.isrequired;
        this.answer=cur_que.answer;
        this.parent_questions = this.getParentQuestion();
        this.dependency_msg = this.generateDependencyMessage();
        var str = this.generateDependencyMessage();
        this.parentQuestionString = str[0];
        this.parentAnswerString = str[1];
    },
    watch:{

        json_response: {
            handler(val, oldVal){
                var cur_que = this.getQuestion(this.queId)
                this.updateVars(cur_que)
            },
            deep:true
        }
    },
    methods:{
        updateAnswer: function(data){
            this.answered_que = data.q
        },
        getQuestion: function(id){
            return this.questions.find(obj => (obj.id==id))
        },
        getParentQuestion: function(){
            // var dependentQuestions = this.questions.filter(obj => (obj.id in Object.keys(this.dependency_join)));
            var dependentQuestions = this.questions.filter(obj =>{
                array = this.dependency_join.map(x => Object.keys(x))
                // console.log(array)
                return obj.id in array
            });

            // console.log(Object.keys(this.dependency_join))
            return dependentQuestions
        },
        generateDependencyMessage: function(){
            var msg = "";
            for(var que of this.dependency_join){
                flag = false;
                questionString = ""
                answerString = ""
                // console.log(Object.entries(que))
                for(var ele of Object.entries(que)){
                    // console.log(ele)
                    var parent = this.getQuestion(ele[0]).text;
                    var ans = ele[1]
                    // console.log(ele[0], parent, ans)
                    if(Array.isArray(ele[1])){
                        if(ele[1].every(val => this.json_response[ele[0]].includes(val))){
                            questionString = questionString + parent + ' and ';
                            answerString = answerString + ans + ' and ';
                            flag = true;
                        }
                        else{
                            questionString=""
                            answerString=""
                            flag = false;
                        }
                    }
                    else{
                        if(_.isEqual(this.json_response[ele[0]], ele[1])){
                            questionString = questionString + parent + ' and ';
                            answerString = answerString + ans + ' and ';
                            flag = true;
                        }
                        else{
                            questionString=""
                            answerString=""
                            flag = false;
                        }
                    }
                
                }
                if (flag){
                    // console.log(str)
                    // return str.slice(0,-4)
                    return [questionString.slice(0,-4), answerString.slice(0,-4)];
                }
            };
            // console.log(parentQuestions)
            return ["",""]
        },
        updateVars:function(cur_que){
            this.id = cur_que.id;
            this.text= cur_que.text;
            this.answer_type= cur_que.answer_type;
            this.dependency_type = cur_que.dependency_type;
            this.dependency_join =cur_que.dependency_join;
            this.answers =cur_que.answers;
            this.isrequired=cur_que.isrequired;
            this.answer=cur_que.answer;
            this.parent_questions = this.getParentQuestion();
            this.dependency_msg = this.generateDependencyMessage();
            var str = this.generateDependencyMessage();
            this.parentQuestionString = str[0];
            this.parentAnswerString = str[1];
        }

    }
})