import {Component, OnInit, ElementRef, OnDestroy, Input , HostListener , ViewChild} from "@angular/core";

import {Observable} from "rxjs";
import {Http} from "@angular/http";
import { Router } from '@angular/router';
import { map } from "rxjs/operators";
import * as d3 from "d3";
import  { FlareJsonService } from "./../services/flare-json.service";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import  d3Tip from 'd3-tip';
import { NodeModel, NodeParentModel } from "../models/node.model";

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
  activeNode: any = 0 ;
  showgraphv : any = false;
  graphshow : any = false;
  incircle : any = false;
  totalDepth : any = 1;
  
  learningprocess : any = [];
  nodeName = '';
  nodeId;
  
  private parentNativeElement: any;
  allNotes: any;
  pack: d3.PackLayout<unknown>;
  g: any;
  color: any;
  tip: any;
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
  margin: number;
  diameter: number;
  parentId = -1;
  zoom: (d: any, cthis: any) => boolean;
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
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
    $( "#nName" ).focus(() => {
      this.showgraph();
    });
    $( "#idSerch" ).focus(() => {
      this.showgraph();
    });
  } 

  createZoomChart(dataNodes?){

    let nthis = this;
    this.graphshow = true;
    // d3.select("svg").remove();
    // d3.select('.graphBox').append("svg");
    d3.selectAll("svg > *").remove();
    nthis.svg = d3.select("svg");
    
    // svg.selectAll("*").remove();
    // var svg = d3.select(chartDiv).append("svg");

    nthis.svg.attr("width", nthis.innerHeight)
          .attr("height", nthis.innerHeight);

    nthis.margin = 0,
    nthis.diameter = +nthis.svg.attr("width"),
    nthis.g = nthis.svg.append("g").attr("transform", "translate(" + nthis.diameter / 2 + "," + nthis.diameter / 2 + ")");

    nthis.color = d3.scaleLinear()
    .domain([-1, 5]);

    nthis.color = nthis.color.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)

    this.pack = d3.pack()
    .size([nthis.diameter - nthis.margin, nthis.diameter - nthis.margin])
    .padding(2);

    // this.simulation = d3.forceSimulation()
    // .force("forceX", d3.forceX().strength(.1).x(this.innerWidth * .5))
    // .force("forceY", d3.forceY().strength(.1).y(this.innerHeight * .5))
    // .force("center", d3.forceCenter().x(this.innerWidth * .5).y(this.innerHeight * .5))
    // .force("charge", d3.forceManyBody().strength(-15));

    

    this.tip = d3Tip().attr('class', 'tooltipbox').html(function(d) {  
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
     
    if(!dataNodes) {
      this.flareJsonService.getRoot().subscribe(root => {
        this.allNotes = JSON.parse(root['_body']);
        const data = this.flareJsonService.parsToD3Hierarchy(JSON.parse(root['_body']));
        this.processData(data);
      });
    }
  } 

  processData(root: any) {
    let nthis = this;
    this.pack(root);

    var focus : any = root,
    nodes = this.pack(root).descendants(),
    view;
    let focusC : any = focus

    
    var circle = this.g.selectAll("circle")
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
      return (colorV!==null && colorV!=="") ? colorV : nthis.color(d.depth) ;
     })
    .on("click", function(d) { 
      //  if (focus !== d)
      // console.log(" focus ", focus);
      // console.log(" d ", d);
      
      if (focus !== d) nthis.zoom(d , this), d3.event.stopPropagation(); 
      })
    // .on('mouseover', function(d : any) {
    //   // console.log("  ", d);
    //   let learningprocess = d.data.learningprocess;
    //   $(".tooltipbox").css('display' , 'none');
    //   if((nthis.activeNode + 1)==d.depth && learningprocess!==undefined &&  learningprocess.length > 0 ){
    //     $(".tooltipbox").css('display' , 'block');
    //      nthis.tabElements[0].className = 'tooltipbox'; nthis.tip.show(d, this);  openTooltip(d);
    //   }
    //   nthis.incircle = true;
    // })
    // .on('mouseout', function(d : any) {
    //   //  console.log("  ", d);
    //    let learningprocess = d.data.learningprocess;
    //    if(learningprocess!==undefined && learningprocess.length ===0 ) $(".tooltipbox").css('display' , 'none');
    //   if((nthis.activeNode + 1)==d.depth){
    //     nthis.incircle = false;
    //   } 
    // })
    .call(d3.drag() // call specific function when circle is dragged
         .on("start", dragstarted)
         .on("drag", dragged)
         .on("end", dragended));

    let simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(-5).y(0)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(0)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.1).radius(3).iterations(2)) // Force that avoids circle overlapping
      .force('attract', d3.forceRadial(0, 250 / 2, 350 / 2).strength(0.2));
    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
      .nodes(nodes)
      .on("tick", function() {
        circle
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          })
      });
        
    circle.call(nthis.tip);

    var text = nthis.g.selectAll("text")
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
    
    var node = nthis.g.selectAll("circle,text");

    nthis.svg.on("click", function() { nthis.zoom(root , this); });
    
    zoomTo([root.x, root.y, root.r * 2 + nthis.margin]);

    // What happens when a circle is dragged?
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
    }

    this.zoom = function zoom(d : any , cthis) {
     
        if(d==null) return false;

        nthis.tip.hide(d, this);
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

        // else if((allChildren===undefined || !(allChildren.length > 0) ||  ((nthis.activeNode + 1)!==d.depth)) && d.depth!==0){ return false;}
        if(d) {
          if(d.data) {
            const pId: number = d.data.id
            nthis.parentId = pId;
          }
        }
         
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
        
        var transition = d3.transition().duration(1750).tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + nthis.margin]);
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
      
        var k = nthis.diameter / v[2]; view = v;
        node.attr("transform", function(d : any) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
    }

    function openTooltip(data : any){                  
      $(".tooltipbox").css('display' , 'block');
      d3.select(".openMenuPopup").on("click", function(d){  nthis.tip.hide(d, this);  nthis.memuModalPopup(data); }); 
    }

    function closeTooltip(d : any){
        console.log(" bbbbbbbbbbbb" , d);
    }
   
    function zoomIn(d  : any ){
      nthis.tip.hide(d, this);
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
      nthis.tip.hide(d, this);
      var currentNodeId = (d.data!==undefined && d.data.id!==undefined) ? d.data.id: 0 ;
      var parentNodeId = (d.parent!==undefined && d.parent!==null && d.parent.data !==undefined) ? d.parent.data.id: 0 ;
      var depth = d.depth;
      var height = d.height;
      
      nthis.showParentNode(depth ,currentNodeId , parentNodeId);
    }
  
    nthis.hideNodeAtStart();

  };

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

    if(parentNodeC <= 0) {
      this.parentId = -1;
    } else {
      this.parentId = allCrrentNodeC;
    }

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

  addNode() {
    let data: NodeParentModel;
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    if(this.parentId <= 0 || typeof this.parentId !== "number") {
      const id = Math.floor(Math.random() * (9999 - 1 + 1)) + 1;
      data = {
        color: "#"+randomColor,
        element: "topic",
        id: id,
        name: this.nodeName,
        progress: false,
        shortname: this.nodeName,
        size: 400,
      };

      this.allNotes['children'].push(data);
      
    } else {
      let parentId = this.parentId;
      this.findObjectById(this.allNotes, parentId);
    }

    setTimeout(() => {
      const newD3DataSet = this.flareJsonService.parsToD3Hierarchy(this.allNotes);
      this.createZoomChart(true);
      this.processData(newD3DataSet);
      this.nodeName = '';
      this.activeNode = 0;
    }, 100);
    
  }

  findObjectById(root, id) {
    let done = false;
    if (root.children) {
        for (var k in root.children) {
          if(!done) {
            if (root.children[k].id == id) {
              const randomColor = Math.floor(Math.random()*16777215).toString(16);
              let childData: NodeParentModel;
              let lastElement;
              if(!root.children[k].children) {
                root.children[k].children = [];
              }
              if(root.children[k].children) {
                const rid = Math.floor(Math.random() * (9999 - 1 + 1)) + 1;
                const firstChild = root.children[k].children;
                lastElement = firstChild[firstChild.length -1];
                if(!lastElement) {
                  childData = {
                    color: "#"+randomColor,
                    element: "topic",
                    id: rid,
                    name: this.nodeName,
                    progress: false,
                    shortname: this.nodeName,
                    size: 400,
                    children:[]
                  };
                } else {
                  childData = {
                    color: "#"+randomColor,
                    element: "topic",
                    id: rid,
                    name: this.nodeName,
                    progress: false,
                    shortname: this.nodeName,
                    size: 400,
                    children:[]
                  };
                }
                done = true;
                root.children[k].children.push(childData);
                root.children[k].children.sort((a, b) =>
                  a - b
                );
              }
              break;
            }
            else if (root.children.length) {
                this.findObjectById(root.children[k], id);
            } 
          }
        }
    }
  }

  addTest() {
    this.showgraph();
    this.flareJsonService.getTest().subscribe(root => {
      const testNotes = JSON.parse(root['_body']);
      this.allNotes['children'].push(testNotes);
      const newD3DataSet = this.flareJsonService.parsToD3Hierarchy(this.allNotes);
      this.createZoomChart(true);
      this.processData(newD3DataSet);
      this.nodeName = '';
      this.activeNode = 0;
    });
  }

  addDelete() {
    this.showgraph();
    const id = +this.nodeId;
    this.findAndDelete(this.allNotes, id);
    const newD3DataSet = this.flareJsonService.parsToD3Hierarchy(this.allNotes);
    this.createZoomChart(true);
    this.processData(newD3DataSet);
    this.nodeId = '';
    this.activeNode = 0;
  }
  
  findAndDelete(root, id) {
    let done = false;
    if (root.children) {
        for (var k in root.children) {
          if(!done) {
            if (root.children[k].id == id) {
              root.children.splice(k, 1);
              done = true;
              break;
            }
            else if (root.children.length) {
                this.findAndDelete(root.children[k], id);
            } 
          }
        }
    }
  }

  searchNode(e: MouseEvent) {
    this.showgraph();
    const id = +this.nodeId;
    let el: any = document.querySelector(`[data-id='${id}']`);
    let data;
    if(el !== null) {
      data = el.__data__;
      if(data) {
        this.zoom(data, e);
      }
    }
  }

  findNode(root, id) {
    let done = false;
    if (root.children) {
        for (var k in root.children) {
          if(!done) {
            if (root.children[k].data.id == id) {
              return root.children[k];
            }
            else if (root.children.length) {
                this.findNode(root.children[k], id);
            } 
          }
        }
    }
  }
}
