/*
  Copyright (c) 2012-2014 Open Lab
  Written by Roberto Bicchierai and Silvia Chelazzi http://roberto.open-lab.com
  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
Ganttalendar.prototype.initZoomlevels = function () {
  //console.debug("Ganttalendar.prototype.initZoomlevels");

  var self = this;

  // define the zoom level arrays 
  this.zoomLevels = [];
  this.zoomDrawers = {};


  function _addZoom(zoom,zoomDrawer){
    self.zoomLevels.push(zoom);
    self.zoomDrawers[zoom] = zoomDrawer;

    //compute the scale
    self.zoomDrawers[zoom].computedScaleX=600/millisFromString(zoom);
  }


  //-----------------------------  3 DAYS  600px-----------------------------
  _addZoom("3d", {
    adjustDates: function (start, end) {
      start.setFirstDayOfThisWeek();
      end.setFirstDayOfThisWeek();
      end.setDate(end.getDate() + 6);
    },
    row1:        function (date, ctxHead) {
      var start = new Date(date.getTime());
      date.setDate(date.getDate() + 6);
      self.createHeadCell(1,this,ctxHead,start.format("MMMM d") + " - " + date.format("MMMM d yyyy")+ " ("+start.format("w")+")",7,"", start,date);
      date.setDate(date.getDate() + 1);
    },
    row2:        function (date, ctxHead, ctxBody) {
      var start = new Date(date.getTime());
      date.setDate(date.getDate() + 1);
      var holyClass = isHoliday(start) ? "holy" : "";
      self.createHeadCell(2,this,ctxHead,start.format("EEE d"), 1, "headSmall "+holyClass, start,date);
      self.createBodyCell(this,ctxBody,1, start.getDay() % 7 == (self.master.firstDayOfWeek + 6) % 7, holyClass);
    }
  });



  //-----------------------------  1 WEEK  600px -----------------------------
  _addZoom("1w", {
    adjustDates: function (start, end) {
      //reset day of week
      start.setFirstDayOfThisWeek();
      start.setDate(start.getDate() - 7);
      end.setFirstDayOfThisWeek();
      end.setDate(end.getDate() + 13);
    },
    row1:        function (date, ctxHead) {
      var start = new Date(date.getTime());
      date.setDate(date.getDate() + 6);
      self.createHeadCell(1,this,ctxHead,start.format("MMM d") + " - " + date.format("MMM d 'yy")+" (" + GanttMaster.messages["GANTT_WEEK_SHORT"]+date.format("w")+")", 7,"",start,date);
      date.setDate(date.getDate() + 1);
    },
    row2:        function (date, ctxHead, ctxBody) {
      var start = new Date(date.getTime());
      date.setDate(date.getDate() + 1);
      var holyClass = isHoliday(start) ? "holy" : "";
      self.createHeadCell(2,this,ctxHead,start.format("EEEE").substr(0, 1)+" ("+start.format("dd")+")", 1, "headSmall "+holyClass, start,date);
      self.createBodyCell(this,ctxBody,1, start.getDay() % 7 == (self.master.firstDayOfWeek + 6) % 7, holyClass);
    }
  });


  //-----------------------------  2 WEEKS  600px -----------------------------
  _addZoom( "2w",{
    adjustDates: function (start, end) {
      start.setFirstDayOfThisWeek();
      start.setDate(start.getDate() - 7);
      end.setFirstDayOfThisWeek();
      end.setDate(end.getDate() + 20);
    },
    row1:        function (date, tr1) {
      var start = new Date(date.getTime());
      date.setDate(date.getDate() + 6);
      self.createHeadCell(1,this,tr1,start.format("MMM d") + " - " + date.format("MMM d 'yy")+" (" + GanttMaster.messages["GANTT_WEEK_SHORT"]+date.format("w")+")", 7,"",start,date);
      date.setDate(date.getDate() + 1);
    },
    row2:        function (date, tr2, trBody) {
     var start = new Date(date.getTime());
      date.setDate(date.getDate() + 1);
      var holyClass = isHoliday(start) ? "holy" : "";
      self.createHeadCell(2,this,tr2,start.format("EEEE").substr(0, 1), 1, "headSmall "+holyClass, start,date);
      self.createBodyCell(this,trBody,1, start.getDay() % 7 == (self.master.firstDayOfWeek + 6) % 7, holyClass);
    }
  });


  //-----------------------------  1 MONTH  600px  -----------------------------
  _addZoom( "1M",{
    adjustDates: function (start, end) {
      start.setMonth(start.getMonth()-1);
      start.setDate(15);
      end.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() + 14);
    },
    row1:        function (date, tr1) {
      var start = new Date(date.getTime());
      date.setDate(1);
      date.setMonth(date.getMonth() + 1);
      date.setDate(date.getDate() - 1);
      var inc=date.getDate()-start.getDate()+1;
      date.setDate(date.getDate() + 1);
      self.createHeadCell(1,this,tr1,start.format("MMMM yyyy"), inc,"",start,date); //spans mumber of dayn in the month
    },
    row2:        function (date, tr2, trBody) {
      var start = new Date(date.getTime());
      date.setDate(date.getDate() + 1);
      var holyClass = isHoliday(start) ? "holy" : "";
      self.createHeadCell(2,this,tr2,start.format("d"), 1, "headSmall "+holyClass, start,date);
      var nd = new Date(start.getTime());
      nd.setDate(start.getDate() + 1);
      self.createBodyCell(this,trBody,1, nd.getDate() == 1, holyClass);
    }
  });



    //-----------------------------  1 QUARTERS   -----------------------------
    _addZoom( "1Q", {
      adjustDates: function (start, end) {
        start.setDate(1);
        start.setMonth(Math.floor(start.getMonth() / 3) * 3 -1 );
        end.setDate(1);
        end.setMonth(Math.floor(end.getMonth() / 3) * 3 + 4);
        end.setDate(end.getDate() - 1);
      },
      row1:        function (date, tr1) {
        var start = new Date(date.getTime());
        date.setMonth(Math.floor(date.getMonth() / 3) * 3 + 3);
        var inc=(date.getMonth()-start.getMonth());
        var q = (Math.floor(start.getMonth() / 3) + 1);
        self.createHeadCell(1,this,tr1,GanttMaster.messages["GANTT_QUARTER"]+" "+q+" "+start.format("yyyy"), inc,"",start,date);
      },
      row2:        function (date, tr2, trBody) {
        var start = new Date(date.getTime());
        date.setMonth(date.getMonth() + 1);
        self.createHeadCell(2,this,tr2,start.format("MMMM"), 1, "headSmall", start,date);
        self.createBodyCell(this,trBody,1, start.getMonth() % 3 == 2);
      }
    });


    //-----------------------------  2 QUARTERS   -----------------------------
  _addZoom( "2Q", {
    adjustDates: function (start, end) {
      start.setDate(1);
      start.setMonth(Math.floor(start.getMonth() / 3) * 3 -3);
      end.setDate(1);
      end.setMonth(Math.floor(end.getMonth() / 3) * 3 + 6);
      end.setDate(end.getDate() - 1);
    },
    row1:        function (date, tr1) {
      var start = new Date(date.getTime());
      date.setMonth(date.getMonth() + 3);
      var q = (Math.floor(start.getMonth() / 3) + 1);
      self.createHeadCell(1,this,tr1,GanttMaster.messages["GANTT_QUARTER"]+" "+q+" "+start.format("yyyy"), 3,"",start,date);
    },
    row2:        function (date, tr2, trBody) {
      var start = new Date(date.getTime());
      date.setMonth(date.getMonth() + 1);
      var lbl = start.format("MMMM");
      self.createHeadCell(2,this,tr2,lbl, 1, "headSmall", start,date);
      self.createBodyCell(this,trBody,1, start.getMonth() % 3 == 2);
    }
  });


  //-----------------------------  1 YEAR  -----------------------------
  _addZoom( "1y", {
    adjustDates: function (start, end) {
      start.setDate(1);
      start.setMonth(Math.floor(start.getMonth() / 6) * 6 -6);
      end.setDate(1);
      end.setMonth(Math.floor(end.getMonth() / 6) * 6 + 12);
      end.setDate(end.getDate() - 1);
    },
    row1:        function (date, tr1) {
      var start = new Date(date.getTime());
      date.setMonth(date.getMonth() + 6);
      var sem = (Math.floor(start.getMonth() / 6) + 1);
      self.createHeadCell(1,this,tr1,GanttMaster.messages["GANTT_SEMESTER"]+" "+sem+"-"+start.format("yyyy") , 6,"",start,date);
    },
    row2:        function (date, tr2, trBody) {
      var start = new Date(date.getTime());
      date.setMonth(date.getMonth() + 1);
      self.createHeadCell(2,this,tr2,start.format("MMM"), 1, "headSmall", start,date);
      self.createBodyCell(this,trBody,1, (start.getMonth() + 1) % 6 == 0);
    }
  });


  //-----------------------------  2 YEAR -----------------------------
  _addZoom( "2y", {
    adjustDates: function (start, end) {
      start.setDate(1);
      start.setMonth(-6);
      end.setDate(30);
      end.setMonth(17);
    },
    row1:        function (date, tr1) {
      var start = new Date(date.getTime());
      var inc=12-start.getMonth();
      date.setMonth(date.getMonth() + inc);
      self.createHeadCell(1,this,tr1,start.format("yyyy"), inc/6,"",start,date);
    },
    row2:        function (date, tr2, trBody) {
      var start = new Date(date.getTime());
      date.setMonth(date.getMonth() + 6);
      var sem = (Math.floor(start.getMonth() / 6) + 1);
      self.createHeadCell(2,this,tr2,GanttMaster.messages["GANTT_SEMESTER"] +" "+ sem, 1, "headSmall", start,date);
      self.createBodyCell(this,trBody,1, sem == 2);
    }
  });



};

    //set a minimal width
    computedTableWidth = Math.max(computedTableWidth, self.minGanttSize);

    var table = $("<table cellspacing=0 cellpadding=0>");
    table.append(tr1).append(tr2).css({width:computedTableWidth});

    var head=table.clone().addClass("fixHead");

    table.append(trBody).addClass("ganttTable");


    table.height(self.master.editor.element.height());

    var box = $("<div>");
    box.addClass("gantt unselectable").attr("unselectable","true").css({position:"relative",width:computedTableWidth});
    box.append(table);

    box.append(head);

    //highlightBar
    var hlb = $("<div>").addClass("ganttHighLight");
    box.append(hlb);
    self.highlightBar = hlb;

    //create link container
    var links = $("<div>");
    links.addClass("ganttLinks").css({position:"absolute",top:0,width:computedTableWidth,height:"100%"});
    box.append(links);

    //compute scalefactor fx
    self.fx = computedTableWidth / (endPeriod - startPeriod);

    // drawTodayLine
    if (new Date().getTime() > self.startMillis && new Date().getTime() < self.endMillis) {
      var x = Math.round(((new Date().getTime()) - self.startMillis) * self.fx);
      var today = $("<div>").addClass("ganttToday").css("left", x);
      box.append(today);
    }

    return box;
  }

  //if include today synch extremes
  if (this.includeToday){
    var today=new Date().getTime();
    originalStartmillis=originalStartmillis>today ? today:originalStartmillis;
    originalEndMillis=originalEndMillis<today ? today:originalEndMillis;
  }


  //get best dimension fo gantt
  var period = getPeriod(zoom, originalStartmillis, originalEndMillis); //this is enlarged to match complete periods basing on zoom level

  //console.debug(new Date(period.start) + "   " + new Date(period.end));
  self.startMillis = period.start; //real dimension of gantt
  self.endMillis = period.end;
  self.originalStartMillis = originalStartmillis; //minimal dimension required by user or by task duration
  self.originalEndMillis = originalEndMillis;

  var table = createGantt(zoom, period.start, period.end);

  return table;
};



//<%-------------------------------------- GANT TASK GRAPHIC ELEMENT --------------------------------------%>
Ganttalendar.prototype.drawTask = function (task) {
  //console.debug("drawTask", task.name,new Date(task.start));

  //var prof = new Profiler("ganttDrawTask");
  var self = this;
  editorRow = task.rowElement;
  var top = editorRow.position().top+ editorRow.offsetParent().scrollTop();

  var x = Math.round((task.start - self.startMillis) * self.fx);

  var taskBox = $.JST.createFromTemplate(task, "TASKBAR");



  //save row element on task
  task.ganttElement = taskBox;

  //if I'm parent
  if (task.isParent())
    taskBox.addClass("hasChild");

  taskBox.css({top:top,left:x,width:Math.round((task.end - task.start) * self.fx)});

  if (this.master.canWrite && task.canWrite) {
    taskBox.resizable({
      handles: 'e' + ( task.depends ? "" : ",w"), //if depends cannot move start
      //helper: "ui-resizable-helper",
      //grid:[oneDaySize,oneDaySize],

      resize:function(event, ui) {
        //console.debug(ui)
        $(".taskLabel[taskId=" + ui.helper.attr("taskId") + "]").css("width", ui.position.left);
        event.stopImmediatePropagation();
        event.stopPropagation();
      },
      stop:function(event, ui) {
        //console.debug(ui)
        var task = self.master.getTask(ui.element.attr("taskId"));
        var s = Math.round((ui.position.left / self.fx) + self.startMillis);
        var e = Math.round(((ui.position.left + ui.size.width) / self.fx) + self.startMillis);

        self.master.beginTransaction();
        self.master.changeTaskDates(task, new Date(s), new Date(e));
        self.master.endTransaction();
      }

    }).on("mouseup",function(){
        $(":focus").blur(); // in order to save grid field when moving task
      });
  }

  taskBox.dblclick(function() {
    self.master.showTaskEditor($(this).closest("[taskId]").attr("taskId"));

  }).mousedown(function() {
      var task = self.master.getTask($(this).attr("taskId"));
      task.rowElement.click();
    });

  //panning only if no depends
  if (!task.depends && this.master.canWrite && task.canWrite) {

    taskBox.css("position", "absolute").draggable({
      axis:'x',
      drag:function (event, ui) {
        $(".taskLabel[taskId=" + $(this).attr("taskId") + "]").css("width", ui.position.left);
      },
      stop:function(event, ui) {
        //console.debug(ui,$(this))
        var task = self.master.getTask($(this).attr("taskId"));
        var s = Math.round((ui.position.left / self.fx) + self.startMillis);

        self.master.beginTransaction();
        self.master.moveTask(task, new Date(s));
        self.master.endTransaction();
      }/*,
       start:function(event, ui) {
       var task = self.master.getTask($(this).attr("taskId"));
       var s = Math.round((ui.position.left / self.fx) + self.startMillis);
       }*/
    });
  }


  var taskBoxSeparator=$("<div class='ganttLines'></div>");
  taskBoxSeparator.css({top:top+taskBoxSeparator.height()});
//  taskBoxSeparator.css({top:top+18});


  self.element.append(taskBox);
  self.element.append(taskBoxSeparator);

  //ask for redraw link
  self.redrawLinks();

  //prof.stop();
};


Ganttalendar.prototype.addTask = function (task) {
  //set new boundaries for gantt
  this.originalEndMillis = this.originalEndMillis > task.end ? this.originalEndMillis : task.end;
  this.originalStartMillis = this.originalStartMillis < task.start ? this.originalStartMillis : task.start;
};


//<%-------------------------------------- GANT DRAW LINK ELEMENT --------------------------------------%>
//'from' and 'to' are tasks already drawn
Ganttalendar.prototype.drawLink = function (from, to, type) {
  var peduncolusSize = 10;
  var lineSize = 2;

  /**
   * A representation of a Horizontal line
   */
  HLine = function(width, top, left) {
    var hl = $("<div>").addClass("taskDepLine");
    hl.css({
      height: lineSize,
      left: left,
      width: width,
      top: top - lineSize / 2
    });
    return hl;
  };

  /**
   * A representation of a Vertical line
   */
  VLine = function(height, top, left) {
    var vl = $("<div>").addClass("taskDepLine");
    vl.css({
      height: height,
      left:left - lineSize / 2,
      width: lineSize,
      top: top
    });
    return vl;
  };

  /**
   * Given an item, extract its rendered position
   * width and height into a structure.
   */
  function buildRect(item) {
    var rect = item.ganttElement.position();
    rect.width = item.ganttElement.width();
    rect.height = item.ganttElement.height();

    return rect;
  }

  /**
   * The default rendering method, which paints a start to end dependency.
   *
   * @see buildRect
   */
  function drawStartToEnd(rectFrom, rectTo, peduncolusSize) {
    var left, top;

    var ndo = $("<div>").attr({
      from: from.id,
      to: to.id
    });

    var currentX = rectFrom.left + rectFrom.width;
    var currentY = rectFrom.height / 2 + rectFrom.top;

    var useThreeLine = (currentX + 2 * peduncolusSize) < rectTo.left;

    if (!useThreeLine) {
      // L1
      if (peduncolusSize > 0) {
        var l1 = new HLine(peduncolusSize, currentY, currentX);
        currentX = currentX + peduncolusSize;
        ndo.append(l1);
      }

      // L2
      var l2_4size = ((rectTo.top + rectTo.height / 2) - (rectFrom.top + rectFrom.height / 2)) / 2;
      var l2;
      if (l2_4size < 0) {
        l2 = new VLine(-l2_4size, currentY + l2_4size, currentX);
      } else {
        l2 = new VLine(l2_4size, currentY, currentX);
      }
      currentY = currentY + l2_4size;

      ndo.append(l2);

      // L3
      var l3size = rectFrom.left + rectFrom.width + peduncolusSize - (rectTo.left - peduncolusSize);
      currentX = currentX - l3size;
      var l3 = new HLine(l3size, currentY, currentX);
      ndo.append(l3);

      // L4
      var l4;
      if (l2_4size < 0) {
        l4 = new VLine(-l2_4size, currentY + l2_4size, currentX);
      } else {
        l4 = new VLine(l2_4size, currentY, currentX);
      }
      ndo.append(l4);

      currentY = currentY + l2_4size;

      // L5
      if (peduncolusSize > 0) {
        var l5 = new HLine(peduncolusSize, currentY, currentX);
        currentX = currentX + peduncolusSize;
        ndo.append(l5);

      }
    } else {
      //L1
      var l1_3Size = (rectTo.left - currentX) / 2;
      var l1 = new HLine(l1_3Size, currentY, currentX);
      currentX = currentX + l1_3Size;
      ndo.append(l1);

      //L2
      var l2Size = ((rectTo.top + rectTo.height / 2) - (rectFrom.top + rectFrom.height / 2));
      var l2;
      if (l2Size < 0) {
        l2 = new VLine(-l2Size, currentY + l2Size, currentX);
      } else {
        l2 = new VLine(l2Size, currentY, currentX);
      }
      ndo.append(l2);

      currentY = currentY + l2Size;

      //L3
      var l3 = new HLine(l1_3Size, currentY, currentX);
      currentX = currentX + l1_3Size;
      ndo.append(l3);
    }

    //arrow
    var arr = $("<img src='../gantt/res/linkArrow.png'>").css({
      position: 'absolute',
      top: rectTo.top + rectTo.height / 2 - 5,
      left: rectTo.left - 5
    });

    ndo.append(arr);

    return ndo;
  }

  /**
   * A rendering method which paints a start to start dependency.
   *
   * @see buildRect
   */
  function drawStartToStart(rectFrom, rectTo, peduncolusSize) {
    var left, top;

    var ndo = $("<div>").attr({
      from: from.id,
      to: to.id
    });

    var currentX = rectFrom.left;
    var currentY = rectFrom.height / 2 + rectFrom.top;

    var useThreeLine = (currentX + 2 * peduncolusSize) < rectTo.left;

    if (!useThreeLine) {
      // L1
      if (peduncolusSize > 0) {
        var l1 = new HLine(peduncolusSize, currentY, currentX - peduncolusSize);
        currentX = currentX - peduncolusSize;
        ndo.append(l1);
      }

      // L2
      var l2_4size = ((rectTo.top + rectTo.height / 2) - (rectFrom.top + rectFrom.height / 2)) / 2;
      var l2;
      if (l2_4size < 0) {
        l2 = new VLine(-l2_4size, currentY + l2_4size, currentX);
      } else {
        l2 = new VLine(l2_4size, currentY, currentX);
      }
      currentY = currentY + l2_4size;

      ndo.append(l2);

      // L3
      var l3size = (rectFrom.left - peduncolusSize) - (rectTo.left - peduncolusSize);
      currentX = currentX - l3size;
      var l3 = new HLine(l3size, currentY, currentX);
      ndo.append(l3);

      // L4
      var l4;
      if (l2_4size < 0) {
        l4 = new VLine(-l2_4size, currentY + l2_4size, currentX);
      } else {
        l4 = new VLine(l2_4size, currentY, currentX);
      }
      ndo.append(l4);

      currentY = currentY + l2_4size;

      // L5
      if (peduncolusSize > 0) {
        var l5 = new HLine(peduncolusSize, currentY, currentX);
        currentX = currentX + peduncolusSize;
        ndo.append(l5);
      }
    } else {
      //L1
      
      var l1 = new HLine(peduncolusSize, currentY, currentX - peduncolusSize);
      currentX = currentX - peduncolusSize;
      ndo.append(l1);

      //L2
      var l2Size = ((rectTo.top + rectTo.height / 2) - (rectFrom.top + rectFrom.height / 2));
      var l2;
      if (l2Size < 0) {
        l2 = new VLine(-l2Size, currentY + l2Size, currentX);
      } else {
        l2 = new VLine(l2Size, currentY, currentX);
      }
      ndo.append(l2);

      currentY = currentY + l2Size;

      //L3

      var l3 = new HLine(currentX + peduncolusSize + (rectTo.left - rectFrom.left), currentY, currentX);
      currentX = currentX + peduncolusSize + (rectTo.left - rectFrom.left);
      ndo.append(l3);
    }

    //arrow
     
    var arr = $("<img src='../gantt/res/linkArrow.png'>").css({
      position: 'absolute',
      top: rectTo.top + rectTo.height / 2 - 5,
      left: rectTo.left - 5
    });

    ndo.append(arr);

    return ndo;
  }

  var rectFrom = buildRect(from);
  var rectTo = buildRect(to);

  // Dispatch to the correct renderer
  if (type == 'start-to-start') {
    this.element.find(".ganttLinks").append(
      drawStartToStart(rectFrom, rectTo, peduncolusSize)
    );
  } else {
    this.element.find(".ganttLinks").append(
      drawStartToEnd(rectFrom, rectTo, peduncolusSize)
    );
  }
};

Ganttalendar.prototype.redrawLinks = function() {
  //console.debug("redrawLinks ");
  var self = this;
  this.element.stopTime("ganttlnksredr");
  this.element.oneTime(60, "ganttlnksredr", function() {
    //var prof=new Profiler("gd_drawLink_real");
    self.element.find(".ganttLinks").empty();

    //[expand]
    var collapsedDescendant = self.master.getCollapsedDescendant();        
    for (var i=0;i<self.master.links.length;i++) {
      var link = self.master.links[i];
      if(collapsedDescendant.indexOf(link.from) >= 0 || collapsedDescendant.indexOf(link.to) >= 0) continue;      
      self.drawLink(link.from, link.to);
    }
    //prof.stop();
  });
};


Ganttalendar.prototype.reset = function() {
  this.element.find(".ganttLinks").empty();
  this.element.find("[taskId]").remove();
};


Ganttalendar.prototype.redrawTasks = function() {  
  //[expand]
  var collapsedDescendant = this.master.getCollapsedDescendant();  
  for (var i=0;i<this.master.tasks.length;i++) {
    var task = this.master.tasks[i];
    if(collapsedDescendant.indexOf(task) >= 0) continue;    
    this.drawTask(task);
  }
};


Ganttalendar.prototype.refreshGantt = function() {
  //console.debug("refreshGantt")
  var par = this.element.parent();

  //try to maintain last scroll
  var scrollY=par.scrollTop();
  var scrollX=par.scrollLeft();

  this.element.remove();
  //guess the zoom level in base of period
  if (!this.zoom ){
    var days = Math.round((this.originalEndMillis - this.originalStartMillis) / (3600000 * 24));
    this.zoom = this.zoomLevels[days < 2 ? 0 : (days < 15 ? 1 : (days < 60 ? 2 : (days < 150 ? 3 : 4  ) ) )];
  }
  var domEl = this.create(this.zoom, this.originalStartMillis, this.originalEndMillis);
  this.element = domEl;
  par.append(domEl);
  this.redrawTasks();

  //set current task
  this.synchHighlight();

  //set old scroll  
  //console.debug("old scroll:",scrollX,scrollY)
  par.scrollTop(scrollY);
  par.scrollLeft(scrollX);

  if (this.showCriticalPath){
    this.master.computeCriticalPath();
    this.gantt.showCriticalPath();
  }


};


Ganttalendar.prototype.fitGantt = function() {
  delete this.zoom;
  this.refreshGantt();
};

Ganttalendar.prototype.synchHighlight = function() {
  if (this.master.currentTask && this.master.currentTask.ganttElement)
    this.highlightBar.css("top", this.master.currentTask.ganttElement.css("top"));
};

Ganttalendar.prototype.centerOnToday = function() {
  var x = Math.round(((new Date().getTime()) - this.startMillis) * this.fx)-30;
  //console.debug("centerOnToday "+x);
  this.element.parent().scrollLeft(x);
};


Ganttalendar.prototype.showCriticalPath = function () {
  //todo
  console.error("To be implemented");
};

