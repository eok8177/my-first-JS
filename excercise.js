var time = 0;
var time_stop = 0;

$(document).ready(function () {

	$(".nav-item > a").attr('href', "/the_end");	// for reset session

	time_stop = $("#inform").data('nowtime');	// time of end excercise

	if ($('#timer')[0]) {
		time = Number($('#timer').html());
		update_time();
		setInterval(update_time, 1000);
	}
	if ($('#timer_pause')[0]) {
		$('#timer_pause').html(split_time(Number($('#timer_pause').html())));
	}

	$('.unbind').click(function () {
		$(window).unbind('beforeunload');
	})

	if ($('#inform_pause')) {					// convert to format 00:00 when pause
		var j = 1;
		while (j <= $("#inform_pause").data('sets')) {
			$("#rest" + j).html(split_time($("#inform_pause").data('rest')));
			j++;
		}
	}

	if ($('#inform').length > 0) {				// get vars from class="inform" and start counts

		var interval_set = 1000;				// Interval beetwen repeats  3000 = 3 sec
		var interval_rest = 1000;				// Interval during rest  1000 = 1 sec

		// fill template
		var i = 1; // loop sets
		var id = 0;  // stop timer
		var sets = $("#inform").data('sets');	// count of sets

		var set_e = "#of" + i;
		var rest_e = "#rest" + i;

		var set = $("#inform").data('of');		// number of repetitions in one set
		var rest = $("#inform").data('rest');	// rest time

		// convert to format 00:00
		var j = 1;
		while (j <= sets) {
			$("#rest" + j).html(split_time(rest));
			j++;
		}

		getReady();		// Wait n seconds (from views/program.php 170 line)
	}

	function getReady() {
		getready_time = Number($('#getready').html());
		var getready_id = setInterval(function () {
			$('.get-ready').fadeIn("normal");
			if (getready_time == 0) {
				clearInterval(getready_id);
				$('.get-ready > p').html('Go');
				$('.get-ready').fadeOut("normal");
				start();	// Start Timers of Set and Rest
			}
			$('#getready').html(getready_time--);
		}, 1000);
	}

	function start() {
		if (sets > 0) {
			if (set > 0) {
				$("#set_attr" + i).attr('class', 'inform doit');
				id = setInterval(setsTimer, interval_set);
			} else if (rest > 0) {
				$("#rest_attr" + i).attr('class', 'inform doit');
				id = setInterval(restTimer, interval_rest);
			} else {
				i++;
				set_e = "#of" + i;
				rest_e = "#rest" + i;
				set = $("#inform").data('of');
				rest = $("#inform").data('rest');
				start();
			}

		}
	}

	function setsTimer() {		// Repeat count
		if (set >= 0) {
			$(set_e).html(set);
			set--;
		}
		else {
			clearInterval(id);
			$("#set_attr" + i).attr('class', 'inform done');
			$("#done" + i).html("done");
			start();
		}
	}

	function restTimer() {		// rest count
		if (rest >= 0) {
			$(rest_e).html(split_time(rest));
			rest--;
		}
		else {
			clearInterval(id);
			$("#rest_attr" + i).attr('class', 'inform');

			sets--;

			if (sets > 0){start();}
			else{								// end of excercise
				pause();
			}
		}

	}

})

function pause() {								// end of excercise
	$("#timer").attr('id', 'timer_pause');
	$(window).unbind('beforeunload');
	$("#time_stop").attr('value', time_stop);
	$("#btn-pause").attr('href', "/pause/"+time_stop);

	$.post(
		"/the_pause/",
		{
			time_stop: time_stop
		},
		onAjaxSuccess
	);
}

function update_time() {
	time_stop++;
	$('#timer').html(split_time(time++));
}

function split_time(seconds) {
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds - minutes * 60;
	if (isNaN(minutes)) minutes = 0;
	if (isNaN(seconds)) seconds = 0;
	if (seconds < 10) seconds = '0' + seconds;
	return minutes + ':' + seconds;
}

$(window).bind('beforeunload', function () {
		$.post(
		"/the_pause/",
		{
			time_stop: time_stop
		},
		onAjaxSuccess
	);
	return "Your exercise will continue to run until you pause it.";
});

function onAjaxSuccess(data){		// Steps after sending the POST to the server
	$("#btn-pause").attr('href', "/unpause/"+time_stop);
	$("#btn-pause").html('START');
	$("#btn-pause").attr('id', "btn-start");
}
