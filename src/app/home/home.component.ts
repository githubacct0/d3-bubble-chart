import {Component, OnInit, ElementRef, OnDestroy, Input , HostListener , ViewChild} from "@angular/core";

import {Observable} from "rxjs";
import {Http} from "@angular/http";
import { Router } from '@angular/router';
import { map } from "rxjs/operators";
import * as d3 from "d3";
import  { FlareJsonService } from "./../services/flare-json.service";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import  d3Tip from 'd3-tip';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [FlareJsonService]
  
 
})
export class HomeComponent implements  OnInit, OnDestroy {

  @ViewChild('memuModalPopupTemp' , {static : false}) memuModalPopupTemp: ElementRef;
  modalRef: BsModalRef;
  modalName : any = '';
  tabElements = document.getElementsByClassName("tooltipbox");
  tabElementstb = document.getElementsByClassName("toolbox");
  private parentNativeElement: any;
  activeNode: any = 0 ;
  showgraphv : any = false;
  graphshow : any = false;
  incircle : any = false;
  totalDepth : any = 1;

  learningprocess : any = [];

  constructor(private element: ElementRef,  private flareJsonService : FlareJsonService,
    private modalService: BsModalService, private router: Router) {
    this.parentNativeElement = element.nativeElement;
  }



  
  innerWidth : any; 
  innerHeight : any;
  circleFromLeft : any;

  @HostListener('window:resize', [])
  public onResize(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.innerHeight = this.innerHeight -150;
    this.circleFromLeft = Math.trunc((this.innerWidth / 2) - (500 / 2));    
    if(this.graphshow)this.createZoomChart();
  }

  ngOnDestroy(): void {
      
  }

  ngOnInit() {
    this.onResize();

    $(document).on('mouseenter', '.tooltipbox', ()=>{

        this.showgraph();
    });

    $(document).on('mouseenter', '.image-box', ()=>{
      this.showgraph();
    });

    $(document).on('mouseleave', '#graphBox', (event)=>{
      // console.log(event.target.nodeName);
      if(event.target.nodeName!=='circle')this.hidegraph(true);
    });

  } 

 


 
  createZoomChart(){

    let nthis = this;
    this.graphshow = true;
    // d3.select("svg").remove();
    // d3.select('.graphBox').append("svg");
    d3.selectAll("svg > *").remove();
    var svg = d3.select("svg");
    
    // svg.selectAll("*").remove();
    // var svg = d3.select(chartDiv).append("svg");

    svg.attr("width", nthis.innerHeight)
          .attr("height", nthis.innerHeight);

    var margin = 0,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    let color : any = d3.scaleLinear()
    .domain([-1, 5]);

    color = color.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)

    var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

    var tip = d3Tip().attr('class', 'tooltipbox').html(function(d) {  
      return `
        <div class='toolbox' (mouseover)="onnmouseTooltip()">
          <div class="tooltip" >
            <div class="row">
                <div class="col-12 title">
                  ${d.data.name}
                </div>
                <div class="col-12 icon">
                  <i class='openMenuPopup fa fa-graduation-cap'></i>
                </div>
            </div>
          </div>
        </div>
      `;
    }); 
    this.graphshow = true;
    const processData = (root: any) => {

      

        pack(root);

        var focus : any = root,
        nodes = pack(root).descendants(),
        view;
        let focusC : any = focus

        
        var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("cx", function(d, i) {   var parent = this.parentNode;  return d3.select(parent).attr('cx'); })
	      .attr("cy", function(d, i) {   var parent = this.parentNode;  return d3.select(parent).attr('cx'); })
        .attr("class", function(d : any) { 
          // console.log(" d ", d);
          let progress = d.data.progress;
          nthis.totalDepth = d.depth;
          var parentId = (d.parent!==undefined && d.parent!==null && d.parent.data !==undefined) ? d.parent.data.id: 0 ;
          var classnm = d.depth ?  "depth_"+d.depth+" " : "depth_0 ";
          classnm += (parseInt(d.data.id) > 0) ?  "node_"+(d.data.id)+" " : "node_0 ";
          classnm += (progress) ?  " completed ": " not-completed ";
          classnm += (parseInt(parentId) !==null) ?  " parent_node_"+(parentId)+" " : " ";
          classnm +=  d.parent ? d.children ? "node" : "node inactive node--leaf" : "node node--root";
          return classnm;
        })
        .attr("data-id", function(d : any) {   return (parseInt(d.data.id) > 0) ? (d.data.id) : "0"; })
        .style("fill", function(d : any) { 
          let colorV = d.data.color;
          return (colorV!==null && colorV!=="") ? colorV : color(d.depth) ;
         })
        .on("click", function(d) { 
          //  if (focus !== d)
          // console.log(" focus ", focus);
          // console.log(" d ", d);
          
          if (focus !== d) zoom(d , this), d3.event.stopPropagation(); 
          })
        .on('mouseover', function(d : any) {
          // console.log("  ", d);
          let learningprocess = d.data.learningprocess;
          $(".tooltipbox").css('display' , 'none');
          if((nthis.activeNode + 1)==d.depth && learningprocess!==undefined &&  learningprocess.length > 0 ){
            $(".tooltipbox").css('display' , 'block');
             nthis.tabElements[0].className = 'tooltipbox'; tip.show(d, this);  openTooltip(d);
          }
          nthis.incircle = true;
        })
        .on('mouseout', function(d : any) {
          //  console.log("  ", d);
           let learningprocess = d.data.learningprocess;
           if(learningprocess!==undefined && learningprocess.length ===0 ) $(".tooltipbox").css('display' , 'none');
          if((nthis.activeNode + 1)==d.depth){
            nthis.incircle = false;
          } 
        });


        circle.call(tip);

       

        var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        // .attr("class", "label")
        .attr("class", function(d : any) {
          var parentId = (d.parent!==undefined && d.parent!==null && d.parent.data !==undefined) ? d.parent.data.id: 0 ;
          var classnm = 'label';
          classnm += d.depth ?  " tdepth_"+d.depth+" " : "tdepth_0 ";
          classnm += (parseInt(d.data.id) > 0) ?  " tnode_"+(d.data.id)+" " : "tnode_0 ";
          classnm += (parseInt(parentId) >0) ?  " tparent_node_"+(parentId)+" " : " ";
          return classnm;
        })
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
        .attr("data-text", function(d : any) { return d.data.shortname; })
        .text(function(d : any) { 
          const dt : any =  d.data; const name  =  dt.name;
          const dname  = (name.length > 20) ? dt.shortname :( (dt.children!==undefined) ?  name :dt.shortname) ;
          return name;
         });
        
        var node = g.selectAll("circle,text");

        svg.on("click", function() { zoom(root , this); });
        
        zoomTo([root.x, root.y, root.r * 2 + margin]);


        function zoom(d : any , cthis) {
         
            if(d==null) return false;

            tip.hide(d, this);
            // console.log(" d ", d);
            // console.log(" focusC ", focusC);
            // console.log(" d.depth > nthis.activeNode ", d.depth , nthis.activeNode);
            
            var dp = d.depth;
            var allChildren : any = d.children;
            var parentData : any = d.parent;
            if(dp==0){
              d = focusC;
            }
            else if(focusC!==undefined &&  ((nthis.activeNode + 2)===d.depth)){
                d = parentData;
            } 
            else if((allChildren===undefined || !(allChildren.length > 0) ||  ((nthis.activeNode + 1)!==d.depth)) && d.depth!==0){ return false;}
             
            var focus0 = focus; focus = d;
            if(d!==null && d.depth > nthis.activeNode){
              focusC = focus.parent;
              $(".tdepth_"+(d.depth)).css('display' , 'none');
              zoomIn(d);

            }
            else{
              if(focus!==null) focusC = focus.parent;
              zoomOut(d);
            }
            
            if(d==null) return false;
            
            var transition = d3.transition().duration(d3.event.altKey ? 7500 : 750).tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
            });                
                
            transition.selectAll("text")
            .filter(function(d : any) { return d.parent === focus || (<any>this).style.display === "inline"; })
            .style("fill-opacity", function(d : any) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d : any) { if (d.parent === focus) (<any>this).style.display = "inline"; })
            .on("end", function(d : any) { if (d.parent !== focus) (<any>this).style.display = "none"; });

            nthis.activeNode = d.depth;

        }
      
        function zoomTo(v) {
          
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d : any) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }

        function openTooltip(data : any){                  
          $(".tooltipbox").css('display' , 'block');
          d3.select(".openMenuPopup").on("click", function(d){  tip.hide(d, this);  nthis.memuModalPopup(data); }); 
        }


    
        function closeTooltip(d : any){
            console.log(" bbbbbbbbbbbb" , d);
        }
       

        function zoomIn(d  : any ){
          tip.hide(d, this);
          // console.log(" d ", d);
          var currentNodeId = (d.data!==undefined && d.data.id!==undefined) ? d.data.id: 0 ;
          var parentNodeId = (d.parent!==undefined && d.parent!==null && d.parent.data !==undefined) ? d.parent.data.id: 0 ;
          var depth = d.depth;
          var height = d.height;
          nthis.hideParentNode(depth ,currentNodeId , parentNodeId  );
          

        }

        function zoomOut(d : any){
          
          if(d===null) return false;
          // console.log(" d : out " , d);
          $(".tooltipbox").css('display' , 'none');
          tip.hide(d, this);
          var currentNodeId = (d.data!==undefined && d.data.id!==undefined) ? d.data.id: 0 ;
          var parentNodeId = (d.parent!==undefined && d.parent!==null && d.parent.data !==undefined) ? d.parent.data.id: 0 ;
          var depth = d.depth;
          var height = d.height;
          
          
          nthis.showParentNode(depth ,currentNodeId , parentNodeId);
          

        }
        
      
        nthis.hideNodeAtStart();

    };

    this.flareJsonService.getRoot().subscribe(root => processData(root));
  } 



  memuModalPopup(d :any) {
    // console.log(" d " , d);
    // console.log(" d.data ", d.data );

    let learningprocess = d.data.learningprocess;
    // console.log(" learningprocess ", learningprocess);
    
    this.learningprocess = learningprocess;
    this.modalName = d.data.name;

    const quesId = d.data.id;
    // this.router.navigate(['/question/'+quesId]);
    this.modalRef = this.modalService.show(this.memuModalPopupTemp , { backdrop: 'static', animated: true, class: ' modal-dialog-centered' });

  }

  hidememuModalPopup(){
    this.modalRef.hide();
  }


  hideToolTip(){
    
    this.tabElements[0].className = 'tooltipbox hide';

    // const tabElements : any = document.getElementsByClassName("tooltipbox");
    var toolTipCl : any = document.querySelectorAll('.tooltipbox');

    if(this.tabElementstb!==undefined && this.tabElementstb.length > 0)this.tabElementstb[0].remove();

    if(toolTipCl && toolTipCl.length > 0){
      var ii = 0;
      toolTipCl.forEach(dphtE => {
          if(ii!==0) (dphtE as HTMLElement).remove();
          ii++;
      });
    }
    
  }

  showgraph(){

    this.showgraphv = true;
    if(!this.graphshow)this.createZoomChart();
    
  }

  hidegraph(hideforce : any = false){
    
    this.showgraphv = false;
    if(this.tabElements[0]!==undefined) this.tabElements[0].className = 'tooltipbox hide';
    if(this.tabElementstb!==undefined && this.tabElementstb.length > 0)this.tabElementstb[0].remove();
    var assToltipC : any = document.querySelectorAll('.tooltipbox');
    var ind = 0;
    if(assToltipC && assToltipC.length > 0){
      assToltipC.forEach(element => {
            if(ind > 0) (element as HTMLElement).remove();
        });
    }
    
  }


  hideParentNode(currentDepth : any = 0 , currentNode : any  = 0 , parentNode : any  = 0){

    var allCrrDepth : any = document.querySelectorAll('.depth_'+currentDepth);
    var allCrrentNodeC : any = document.querySelectorAll('.parent_node_'+parentNode);
    var parentNodeC : any = document.querySelectorAll('.node_'+parentNode);
    
    // console.log(" currentNode ", currentNode);
    // console.log(" currentDepth ", currentDepth);
    // console.log(" parentNode ", parentNode);
    // console.log(" totalDepth ", this.totalDepth);
    
    $(".depth_"+currentDepth).css('display' , 'none');
    $(".node").removeClass('current-node');
    $(".node_"+currentNode).css('display' , 'inline');
    $(".node_"+currentNode).addClass('current-node');

    $(".tdepth_"+(currentDepth+1)).css('display' , 'none');
    $(".tnode_"+currentNode).css('display' , 'inline');

    // $(".depth_"+(currentDepth -1)).removeClass('active').addClass('inactive');
    // $(".depth_"+(currentDepth)).removeClass('inactive').addClass('active');
    // $(".depth_"+(currentDepth + 1)).removeClass('active').addClass('inactive');

    let depth2 = (currentDepth+1);
    let allCrrDepthP1 : any = document.querySelectorAll('.depth_'+depth2);
    if(allCrrDepthP1 && allCrrDepthP1.length > 0){            
      allCrrDepthP1.forEach(dphtE  => {  
        var className : any  = (dphtE as HTMLElement).className;              
        var crrN = (className.baseVal).includes('parent_node_'+currentNode);
        if(crrN){  
          let clsArr = (className.baseVal).split(' ');
          if(clsArr[1] && clsArr[1]!==undefined){
              let crr_nodeArr = (clsArr[1]).split('_');
              let crr_node = crr_nodeArr[1];
              // console.log(" crr_node =========== ", crr_node);
              // console.log(" (depth2 + 1) ", (depth2 + 1));
              
              
              $(".node_"+crr_node).addClass('current-node');
              $('.depth_'+(depth2 + 1)).css('display' , 'none');
              setTimeout(() => {
                $(".parent_node_"+crr_node).css('display' , 'inline');  
              }, 500); 
              
              setTimeout( ()=>{
                $(".node_"+crr_node).each( function( index, listItem ) {
                  const id = $(this).attr('data-id');
                  const redious = $(this).attr('r');                  
                  const stext = $(".tnode_"+id).attr("data-text");
                  const ftext = $(".tnode_"+id).text();
                  if((ftext.length * 3.9) > redious ){
                    $(".tnode_"+id).html(stext);
                  }
                  
                });
              } , 500 )
          }
        }else{
          (dphtE as HTMLElement).style.display = 'none';
        }
      });
    }  


    if(currentDepth > 0){
      for (let index = (currentDepth-1); index >= 0; index--) {
        $('.depth_'+index).css('display' , 'none');
      }
    }


  }

  hideNodeAtStart(currentDepth : any = 0 , currentNode : any  = 0 , parentNode : any  = 0){
    
    if( this.totalDepth > 0){
      for (let index = 0; 2 >= index; index++) {
        $('.depth_'+index).css('display', 'inline');
        $(".depth_"+index).removeClass('current-node');
        if(index==1) {
          $(".depth_"+index).addClass('current-node');

          $(".depth_"+index).each( function( index, listItem ) {
            const id = $(this).attr('data-id');
            const redious = $(this).attr('r');
            const stext = $(".tnode_"+id).attr("data-text");
            const ftext = $(".tnode_"+id).text();
            if((ftext.length * 3.9) > redious ){
              $(".tnode_"+id).html(stext);
            }
            
          });

        }
      }

      for (let index = 3; this.totalDepth >= index; index++) {
        $('.depth_'+index).css('display', 'none');
        $(".depth_"+index).removeClass('current-node');
      }
    }

  }


  showParentNode(currentDepth : any = 0 , currentNode : any  = 0 , parentNode : any  = 0){

    var allCrrentNodeC : any = document.querySelectorAll('.depth_'+currentNode);
    var allChildNodeC : any = document.querySelectorAll('.parent_node_'+currentNode);
    var parentNodeC : any = document.querySelectorAll('.node_'+parentNode);
    
    // console.log(" currentDepth ", currentDepth);
    // console.log(" currentNode ", currentNode);
    // console.log(" parentNode ", parentNode);
    // console.log("  totalDepth ", this.totalDepth);

    if(currentDepth > 0){

      // Hide text
      
      $(".tdepth_"+(currentDepth+1)).css('display' , 'none');      
      
      $(".depth_"+currentDepth).css('display' , 'none');
      $(".node").removeClass('current-node');
      $(".node_"+currentNode).css('display' , 'inline');
      $(".parent_node_"+currentNode).css('display' , 'inline');
      $(".node_"+currentNode).addClass('current-node');
      $(".node_"+parentNode).css('display' , 'none');

      $(".depth_"+(currentDepth +3)).css('display' , 'none');
      $(".tnode_"+currentNode).css('display' , 'inline');

      // $(".depth_"+currentDepth).removeClass('active').addClass('inactive');
      // $(".depth_"+(currentDepth+1)).removeClass('inactive').addClass('active');

      let depth2 = (currentDepth+1);
      let allCrrDepthP1 : any = document.querySelectorAll('.depth_'+depth2);
      if(allCrrDepthP1 && allCrrDepthP1.length > 0){            
        allCrrDepthP1.forEach(dphtE  => {  
          var className : any  = (dphtE as HTMLElement).className;              
          var crrN = (className.baseVal).includes('parent_node_'+currentNode);
          if(crrN){  
            let clsArr = (className.baseVal).split(' ');
            if(clsArr[1] && clsArr[1]!==undefined){
                let crr_nodeArr = (clsArr[1]).split('_');
                let crr_node = crr_nodeArr[1];
                // console.log(" crr_node =========== ", crr_node);
                // console.log(" (depth2 + 1) ", (depth2 + 1));
                
                
                $(".node_"+crr_node).addClass('current-node');
                $('.depth_'+(depth2 + 1)).css('display' , 'none');
                setTimeout(() => {
                  $(".parent_node_"+crr_node).css('display' , 'inline');  
                  $(".parent_node_"+crr_node).removeClass('inactive').addClass('active');
                }, 500); 
                
                setTimeout( ()=>{
                  $(".node_"+crr_node).each( function( index, listItem ) {
                    const id = $(this).attr('data-id');
                    const redious = $(this).attr('r');                  
                    const stext = $(".tnode_"+id).attr("data-text");
                    const ftext = $(".tnode_"+id).text();
                    if((ftext.length * 3.9) > redious ){
                      $(".tnode_"+id).html(stext);
                    }
                    
                  });
                } , 500 )
            }
          }else{
            (dphtE as HTMLElement).style.display = 'none';
          }
        });
      }  


      if(currentDepth > 0){
        for (let index = (currentDepth-1); index >= 0; index--) {
          $('.depth_'+index).css('display' , 'none');
        }
      }
      
    }
    else{
      this.hideNodeAtStart(currentDepth , currentNode , parentNode);
    }
        


  }


}




