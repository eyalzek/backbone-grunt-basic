var app = (function() {
	var Events = _.extend({}, Backbone.Events),
		correctCounter = 0,
		questionIndex = 0,
		questionsArray = [];

	var Question = Backbone.Model.extend({
		defaults: {
			"selected": -1,
			"correct": null
		}
	});

	var AllQuestions = Backbone.Collection.extend({model: Question}),
		questions,
		that = this;


	var QuestionView = Backbone.View.extend({
		tagName: "form",

		getSelected: function() {
			return this.model.get("selected");
		},

		select: function (value) {
			this.model.set("selected", value);
		},

		events: {
			"change input:radio": "getAnswer",
			"click .next": "checkAnswer",
			"click .previous": "previousQuestion"
		},

		getAnswer: function(e) {
			this.select(parseInt($(e.currentTarget).val(), 10));
			console.log("CURRENT SELECTION: ", this.getSelected());
		},

		checkAnswer: function(e) {
			e.preventDefault();
			if (this.getSelected() !== -1) {
				// console.log("THIS:", this.getSelected());
				// Events.trigger("SetSelection", this);
				Events.trigger("SubmitAnswer", this);
			}
			else {
				if ($(".message").html() === "") {
					$("form").append("<div class='message'>You must choose an answer!</div>");
				}
			}
		},

		previousQuestion: function(e) {
			e.preventDefault();
			Events.trigger("GoBack", this);
		},

		render: function(question) {
			var template = _.template($("#questionForm").html());
			this.$el.html(template({"question": question, "index": questionIndex}));
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
			displayQuestion();
			$(".message").empty();
		});
	}

	function displayQuestion() {
		console.log("Correct answers: ", correctCounter);
		// console.log("question.models: ", that.questions.models);
		var currentQuestion = that.questions.models[questionIndex];
		if (questionIndex < that.questions.length) {
			// console.log(questionIndex);
			// console.log(currentQuestion);
			var qView = new QuestionView({model: currentQuestion});
			qView.render(currentQuestion);
			$(".container").append(qView.$el);
			// console.log("HERE: ", qView.model.get("selected"));
		}
		else {
			$(".container")
				.append("<p>your score is: " + correctCounter + "!</p>")
				.append("<button>Start over?</button>");
			$("button").on("click", restart);
		}
	}

	function restart() {
		correctCounter = 0;
		questionIndex = 0;
		$(".container").empty();
		_.each(that.questions.models, function(model) {
			model.set("selected", -1);
			model.set("correct", null);
		});
		displayQuestion();
	}

	Events.on("SubmitAnswer", function(view) {
		// console.log(view);
		var alreadyAnswered = view.model.get("correct"),
			currentSelection = view.model.get("selected"),
			correctAnswer = view.model.get("correctAnswer");

		if (_.isNull(alreadyAnswered)) {
			if (currentSelection === correctAnswer) {
				correctCounter += 1;
				view.model.set("correct", true);
			}
		}
		else if (alreadyAnswered && (currentSelection !== correctAnswer)) {
			correctCounter -= 1;
			view.model.set("correct", false);
		}
		else if (!alreadyAnswered && (currentSelection === correctAnswer)) {
			correctCounter += 1;
			view.model.set("correct", true);
		}

		questionIndex += 1;
		view.remove();
		displayQuestion();
	});

	Events.on("GoBack", function(view) {
		questionIndex -= 1;
		view.remove();
		displayQuestion();
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