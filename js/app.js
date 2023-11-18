(function($){

  // Schwellwerte für gelbe und rote Markierung 120 = 100%, 
  var warn_yellow = 90; // 90=75%
  var warn_red = 110; // 108=90%

	var blinker = true;
	var fin;
	var ksize;
	var min = parseInt($('#min').val());
	var sec = parseInt($('#sec').val());
	var offset = parseInt(60*min+sec);
	var wheight = 600;
	var isPause;
	var pausetime = 0;

	function blink() 
	{
		$('.dial').trigger('configure', {'fgColor':blinker ? '#a94442' : '#d9534f' });
		blinker = !blinker;
	};

	function start() 
	{
		togglePauseButton();

		// not started?
		//console.log(isPause);
		if (isPause === undefined) {
			$('input[type="text"]').css('color', '#5cb85c');
			$('.dial').trigger('configure', {'fgColor':'#5cb85c'});
			var minPause = parseInt($('#min').val());
			var secPause = parseInt($('#sec').val());
			offset = parseInt(60*minPause+secPause);
			$('#timer').data('countdown').update(+(new Date) + ((60 * minPause + secPause) * 1000)).start();
			isPause = false;
			return;
		}
		pause();
	};

	function stop()
	{

		togglePauseButton(true);

		$('input[type="text"]').css('color', 'black');
		var minInput = $('#min');
		var secInput = $('#sec');
		minInput.val(minInput.data('default'));
		secInput.val(secInput.data('default'));
		$('.dial').val(0).trigger('change');
		$('#timer').data('countdown').stop();
		clearInterval(fin);
		toggleTimer();
	};

	function pause()
	{
  	var timer = $('#timer').data('countdown');

  	if(isPause && ! timer.interval)
  	{	
  		timer.restart(timer.options);
  		timeshift(-((new Date()).getTime()-pausetime));
  		isPause = false;
  	}
  	else
  	{
  		pausetime = (new Date()).getTime();
  		timer.stop();

  		isPause = true;
  	}
	};

	function setSizes() 
	{
		wmin = Math.min(parseInt($(window).height()),parseInt($(window).width()));
		ksize = parseInt(wmin-(wmin*0.05));
		var fs = ksize-100 + "%";
		$('.time').css('font-size', fs);
		$('body').css('margin-top', parseInt(ksize*0.025)+"px");	
		$('#timer').css('width', parseInt(ksize*0.39)+"px");
		var twidth = ($('#timer').css('width'));
		var theight = ($('#timer').css('height'));
		$('#timer').css('top', parseInt((ksize+ksize*0.025)/2) - parseInt(theight)/2 + "px");
		$('#timer').css('left', parseInt($(window).width()/2) - parseInt(twidth)/2 + "px");
	};

	function togglePauseButton(reset)
	{
		if (reset) {
			$('#start').removeClass('button-warning button-success').addClass('button-success');
			$('#start i').removeClass('fa-pause').addClass('fa-play');
			isPause = undefined;
			pausetime = 0;
			return;
		}
		$('#start').toggleClass('button-success button-warning');
		$('#start i').toggleClass('fa-play fa-pause');
	}

	function toggleTimer(show) 
	{
		show = typeof show !== 'undefined' ? show : true;
		var thickness = 0.55;
		var icon = $('#mode i');
		if (show) 
		{
			$('#timer').show();
			show = false;
			if(!icon.hasClass('fa-eye-slash')) 
			{
				$('#mode i').toggleClass('fa-eye fa-eye-slash');
			};
		}
		else
		{
			$('#timer').hide();
			thickness = 0.99;
			show = true;
		};
		$('#mode').data('mode', show);
		icon.toggleClass('fa-eye fa-eye-slash');
		dial.trigger('configure', {'thickness': thickness});
	}

	setSizes();

	var dial = $(".dial").knob({
		'min':0,
		'max':120, 
		'readOnly': true,
		'width': ksize,
		'height': ksize,
		'fgColor': '#5cb85c',
		'dynamicDraw': true,
		'thickness': 0.55,
		'displayInput': false
	});
	
	$(window).resize(function() 
	{
		setSizes();
		dial.trigger('configure', {'width':ksize, 'height': ksize}); 
	});



	$('#timer').countdown(
	{
		refresh: 500,
		date: +(new Date) + ((60 * min + sec) * 1000),
		render: function(data) 
		{
			if (data.sec === 60) { return; };
    	$('#min').val(this.leadingZeros(data.min, 2));
  		$('#sec').val(this.leadingZeros(data.sec, 2));
  		var step = 120-((data.min*60 + data.sec) * 120 / offset);
  		step = step <= 1 ? 1 : step; 
  		if (step >= warn_yellow) 
  		{
				dial.trigger('configure', {'fgColor':'#f0ad4e'}); 
				$('.time').css('color', '#f0ad4e');
  		};
  		if (step >= warn_red) 
  		{
				dial.trigger('configure', {'fgColor':'#d9534f'}); 
				$('.time').css('color', '#c9302c');
  		};
    	$(".dial").val(step).trigger('change');
		},
    onEnd: function() 
    {
    	toggleTimer();
      fin = setInterval(blink, 500);
    }
	});	

	function timeshift(offset)
	{
		var timer = $('#timer').data('countdown');
		var endtime = timer.options.date.getTime();
		var newtime = endtime - offset;

		timer.update(new Date(newtime));
	};

	$('body').keyup(function(e)
	{
		//console.log(e.keyCode);
		// Arrow-up
		if(e.keyCode == 38)
		{
			timeshift(-60000);
		}
		// Arrow-down
		if(e.keyCode == 40)
		{
			timeshift(60000);
		}

    // ESC-key
		if(e.keyCode == 27)
		{
			stop();
    }
    // Space-key
    if(e.keyCode == 32)
    {
      start();
    }
    // H-Key
    if(e.keyCode == 72)
    {
      toggleTimer($('#mode').data('mode'));
    }
	});

	$('#start').on("touchstart click", function(event)
	{
    event.stopPropagation();
    event.preventDefault();
    if(event.handled !== true) {
      start();
      event.handled = true;
    } else {
      return false;
    }
	});

	$('#stop').on("touchstart click", function(event)
	{
        event.stopPropagation();
        event.preventDefault();
        if(event.handled !== true) {
            stop();
            event.handled = true;
        } else {
            return false;
        }
	});

	$('#mode').click(function() 
	{
		toggleTimer($(this).data('mode'));
	});
  
  stop();

})(jQuery)
