import { Component, ViewChild, ElementRef } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';


@Component({
  selector: 'date-time-picker',
  templateUrl: 'date-time-picker.html'
})
export class DateTimePickerComponent {
  
  @ViewChild("reloj") reloj:ElementRef;
  public hoursView: HTMLDivElement;
  public minutesView: HTMLDivElement;

  private hour:string="12";
  private minute:string="00";
  public a="am";

  constructor(private viewCtrl: ViewController, public navParams: NavParams) {
  }

  ionViewDidEnter(){

    //Para el contenedor de la hora
    this.hoursView =  document.createElement("div");
    this.hoursView.classList.add("clockpicker-hours");
    this.hoursView.classList.add("clockpicker-dial");
    this.reloj.nativeElement.appendChild(this.hoursView);

    //Para el contenedor de los minutos
    this.minutesView =  document.createElement("div");
    this.minutesView.classList.add("clockpicker-dial");
    this.minutesView.classList.add("clockpicker-minutes");
    this.minutesView.classList.add("hidden-trans");
    this.minutesView.setAttribute("hidden", "");
    this.reloj.nativeElement.appendChild(this.minutesView);

    let docehoras = this.navParams.get("doceHoras");
    this.setHours(docehoras);
  }

  private setHours(doceHoras:boolean){
    
    // Can I use transition ?
    var transitionSupported = (function(){
      var style = document.createElement('div').style;
      return 'transition' in style ||
        'WebkitTransition' in style ||
        'MozTransition' in style ||
        'msTransition' in style ||
        'OTransition' in style;
    })();
    
    //para calculos de posicionamiento
    let dialRadius = 100,
		outerRadius = 80,
		// innerRadius = 80 on 12 hour clock
		innerRadius = 54,
		tickRadius = 13,
		diameter = dialRadius * 2,
    duration = transitionSupported ? 350 : 1;
    
    let  tickTpl = document.createElement("div");
    tickTpl.classList.add("clockpicker-tick");
    let i, tick:HTMLDivElement, radian, radius;

    // Hours view
  if (doceHoras === true) {
    for (i = 1; i < 13; i += 1) {
      tick = tickTpl.cloneNode() as HTMLDivElement;
      radian = i / 6 * Math.PI;
      radius = outerRadius;
      tick.style.fontSize = '120%';
      tick.style.left = (dialRadius + Math.sin(radian) * radius - tickRadius).toString()+ "px";
      tick.style.top= (dialRadius - Math.cos(radian) * radius - tickRadius).toString()+ "px";
      tick.innerHTML = i === 0 ? '00' : i;
      tick.onclick = function(e){
        this.setHour(e.srcElement.innerHTML);
        console.log(e.srcElement.innerHTML);
      }.bind(this);
      this.hoursView.appendChild(tick);
    }
  } else {
    for (i = 0; i < 24; i += 1) {
      tick = tickTpl.cloneNode() as HTMLDivElement;
      radian = i / 6 * Math.PI;
      var inner = i > 0 && i < 13;
      radius = inner ? innerRadius : outerRadius;
      tick.style.left = (dialRadius + Math.sin(radian) * radius - tickRadius).toString()+ "px";
      tick.style.top= (dialRadius - Math.cos(radian) * radius - tickRadius).toString()+ "px";
      if (inner) {
        tick.style.fontSize = '120%';
      }
      tick.innerHTML = i === 0 ? '00' : i;
      tick.onclick = function(e){
        this.setHour(e.srcElement.innerHTML);
        console.log(e.srcElement.innerHTML);
      }.bind(this);
      this.hoursView.appendChild(tick);
      //tick.on(mousedownEvent, mousedown);
    }

  }
    this.setMinutes(dialRadius, outerRadius, tickRadius);
  }

  
  public setMinutes(dialRadius, outerRadius, tickRadius){

    let  tickTpl = document.createElement("div");
    tickTpl.classList.add("clockpicker-tick");
    let i, tick:HTMLDivElement, radian, radius;

    for (i = 0; i < 60; i += 15) {
      tick = tickTpl.cloneNode() as HTMLDivElement;
      radian = i / 30 * Math.PI;
      tick.style.left = (dialRadius + Math.sin(radian) * outerRadius - tickRadius).toString()+ "px";
      tick.style.top= (dialRadius - Math.cos(radian) * outerRadius - tickRadius).toString()+ "px";

      tick.style.fontSize = '120%';
      tick.innerHTML =  this.leadingZero(i).toString();
      tick.onclick = function(e){
        this.setMinute(e.srcElement.innerHTML);
        console.log(e.srcElement.innerHTML);
      }.bind(this);
      this.minutesView.appendChild(tick);
      //tick.on(mousedownEvent, mousedown);
    }

  }

  private leadingZero(num) {
		return (num < 10 ? '0' : '') + num;
  }
  
  public setHour(hour){
    this.hour = hour;
    this.minutesView.classList.remove("hidden-trans");
    this.minutesView.removeAttribute("hidden");

    this.hoursView.classList.add("hidden-trans");
    setTimeout(function(){
      this.hoursView.setAttribute("hidden", "");
    }.bind(this), 1000);
  }

  public setMinute(minute){
    this.minute = minute;
  }

  public setDateTime(){
    this.viewCtrl.dismiss(this.hour+ ":"+ this.minute+ " "+ this.a);
  }

  public clear(){
    this.minutesView.classList.add("hidden-trans");
    this.minutesView.setAttribute("hidden", "");
    this.hoursView.classList.remove("hidden-trans");
    this.hoursView.removeAttribute("hidden");
    this.hour = "12";
    this.minute = "00";
  }

  public setA(m){
    this.a=m;
  }

  /*

  // Clicking on minutes view space
  plate.on(mousedownEvent, function(e){
    if ($(e.target).closest('.').length === 0) {
      mousedown(e, true);
    }
  });

  // Mousedown or touchstart
  function mousedown(e, space) {
    var offset = plate.offset(),
      isTouch = /^touch/.test(e.type),
      x0 = offset.left + dialRadius,
      y0 = offset.top + dialRadius,
      dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
      dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
      z = Math.sqrt(dx * dx + dy * dy),
      moved = false;

    // When clicking on minutes view space, check the mouse position
    if (space && (z < outerRadius - tickRadius || z > outerRadius + tickRadius)) {
      return;
    }
    e.preventDefault();

    // Set cursor style of body after 200ms
    var movingTimer = setTimeout(function(){
      $body.addClass('clockpicker-moving');
    }, 200);

    // Place the canvas to top
    if (svgSupported) {
      plate.append(self.canvas);
    }

    // Clock
    self.setHand(dx, dy, ! space, true);

    // Mousemove on document
    $doc.off(mousemoveEvent).on(mousemoveEvent, function(e){
      e.preventDefault();
      var isTouch = /^touch/.test(e.type),
        x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
        y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
      if (! moved && x === dx && y === dy) {
        // Clicking in chrome on windows will trigger a mousemove event
        return;
      }
      moved = true;
      self.setHand(x, y, false, true);
    });

    // Mouseup on document
    $doc.off(mouseupEvent).on(mouseupEvent, function(e){
      $doc.off(mouseupEvent);
      e.preventDefault();
      var isTouch = /^touch/.test(e.type),
        x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
        y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
      if ((space || moved) && x === dx && y === dy) {
        self.setHand(x, y);
      }
      if (self.currentView === 'hours') {
        self.toggleView('minutes', duration / 2);
      } else {
        if (options.autoclose) {
          self.minutesView.addClass('clockpicker-dial-out');
          setTimeout(function(){
            self.done();
          }, duration / 2);
        }
      }
      plate.prepend(canvas);

      // Reset cursor style of body
      clearTimeout(movingTimer);
      $body.removeClass('clockpicker-moving');

      // Unbind mousemove event
      $doc.off(mousemoveEvent);
    });
  }*/

}
