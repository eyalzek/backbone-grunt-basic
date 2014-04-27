var app = (function() {
	var Events = _.extend({}, Backbone.Events),
		chosen = -1,
		correctCounter = 0,
		questionIndex = 0,
		questionsArray = [];

	var Question = Backbone.Model.extend({});

	var AllQuestions = Backbone.Collection.extend({model: Question}),
		questions,
		that = this;


	var QuestionView = Backbone.View.extend({
		tagName: "form",

		selection: -1,

		events: {
			"change input:radio": "getAnswer",
			"click .next": "checkAnswer"
		},

		getAnswer: function(e) {
			this.selection = parseInt($(e.currentTarget).val(), 10);
			Events.trigger("GetChosen", this.selection);
		},

		checkAnswer: function(e) {
			e.preventDefault();
			if (chosen !== -1) {
				Events.trigger("SubmitAnswer", this);
			}
			else {
				// console.log("chosen:", chosen);
				if ($(".message").html() === "") {
					$("form").append("<div class='message'>You must choose an answer!</div>");
				}
			}
		},

		render: function(question) {
			var template = _.template($("#questionForm").html());
			this.$el.html(template({question: question}));
			return this;
		}
	});

	function loadQuestions() {
		$.getJSON("/questions.json", function(json, textStatus) {
			console.log("status: " + textStatus);
			_.each(json, function(current, index) {
				questionsArray.push(new Question(current));
			});
			that.questions = new AllQuestions(questionsArray);
			// console.log(that.questions);
			displayNextQuestion();
			$(".message").empty();
		});
	}

	function displayNextQuestion() {
		console.log("question.models: ", that.questions.models);
		var currentQuestion = that.questions.models[questionIndex];
		if (questionIndex < that.questions.length) {
			// console.log(questionIndex);
			// console.log(currentQuestion);
			var qView = new QuestionView({model: currentQuestion});
			qView.render(currentQuestion);
			$(".container").append(qView.$el);
		}
		else {
			$(".container")
				.append("<p>your score is: " + correctCounter + "!</p>")
				.append("<button>AGAIN</button>");
			$("button").on("click", restart);
		}
	}

	function restart() {
		correctCounter = 0;
		questionIndex = 0;
		$(".container").empty();
		displayNextQuestion();
	}

	Events.on("GetChosen", function(selection) {
		chosen = selection;
		console.log(chosen);
	});

	Events.on("SubmitAnswer", function(view) {
		// console.log(view);
		if (chosen === view.model.get("correctAnswer")) correctCounter += 1;
		questionIndex += 1;
		chosen = -1;
		view.remove();
		displayNextQuestion();
	});

	return {
		init: function() {
			$(".message").html("Please wait, loading questions...");
			loadQuestions();
		}
	};
})();

$(document).ready(function() {
	app.init();
});