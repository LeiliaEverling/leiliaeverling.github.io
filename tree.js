import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { COLORS } from "./storyTreeAttributes.js";

const Url = {
    get get(){
        var vars= {};
        if(window.location.search.length!==0)
            window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value){
                key=decodeURIComponent(key);
                if(typeof vars[key]==="undefined") {vars[key]= decodeURIComponent(value);}
                else {vars[key]= [].concat(vars[key], decodeURIComponent(value));}
            });
        return vars;
    }
};

function formatURL(work, chapter) {
    return `https://archiveofourown.org/works/${work}/chapters/${chapter}`;
}

const Tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

export function Tree(data, MAX_DEPTH) {
    // Specify the charts’ dimensions. The height is variable, depending on the layout.
    const width = 300 * MAX_DEPTH;
    const marginTop = 100;
    const marginRight = 10;
    const marginBottom = 30;
    const marginLeft = 120;

    function wrap() {
        var self = d3.select(this),
            textLength = self.node().getComputedTextLength(),
            text = self.text();
        while (textLength > (width - 2 * 175) && text.length > 0) {
            text = text.slice(0, -1);
            self.text(text + '...');
            textLength = self.node().getComputedTextLength();
        }
    } 
  
    // Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
    // (dx is a height, and dy a width). This because the tree must be viewed with the root at the
    // “bottom”, in the data domain. The width of a column is based on the tree’s height.
    const root = d3.hierarchy(data);
    const dx = 30;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);
  
    // Define the tree layout and the shape for links.
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
  
    // Create the SVG container, a layer for the links and a layer for the nodes.
    const svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "height: auto; font: 16px sans-serif; user-select: none;");
  
    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", 3);
  
    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        // .attr("pointer-events", "all");
  
    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
        const nodes = root.descendants().reverse();
        const links = root.links();
  
        // Compute the new tree layout.
        tree(root);
    
        let left = root;
        let right = root;
        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });
  
        const height = right.x - left.x + marginTop + marginBottom;
    
        const transition = svg.transition()
            .duration(duration)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            Tooltip
                .style("opacity", 1)
                .style("visibility", "visible")
        }

        var mousemove = function(d) {
            let node_data = d.target.__data__.data;
            let status = node_data.type ? node_data.type : "Available";

            Tooltip
                .html("Path Type: " + status)
                .style("left", (d.pageX+30) + "px")
                .style("top", (d.pageY) + "px")
        }
        
        var mouseleave = function(d) {
            Tooltip
                .style("opacity", 0)
                .style("visibility", "hidden")
        }

        // Update the nodes…
        const node = gNode.selectAll("g")
            .data(nodes, d => d.id);
    
        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);
  
        nodeEnter.append("circle")
            .attr("r", 10)
            .attr("fill", function(d) {
                if (d.data.path == true) {
                    return COLORS["Current Path"];
                } else {
                    return d.data.type ? COLORS[d.data.type] : COLORS["Available"]
                }
            })
            .attr("fill-opacity", 0.8)
            .attr("stroke", function(d) {
                if (d.data.path == true) {
                    return COLORS["Current Path"];
                } else {
                    return d.data.type ? COLORS[d.data.type] : COLORS["Available"]
                }
            })
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 1)
            .on("click", (event, d) => {
                d.children = d.children ? null : d._children;
                update(event, d);
            });
  
        const nodeLink = nodeEnter.append("a")
            .attr("href", d => formatURL(d.data.work, d.data.chapter))
            .attr("target", "_blank")
      
        nodeLink.append("text")
            .attr("width", "100%")
            .attr("dy", "0.36em")
            .attr("x", d => d._children ? -14 : 14)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(d => d.data.name)
            .attr("fill", "#FFF")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "#0B0C10")
            .attr("paint-order", "stroke")
            .attr("text-decoration", "underline")
            .style("text-underline-offset", "2px")
            .each(wrap);

        nodeEnter
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
  
        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);
  
        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);
    
        // Update the links…
        const link = gLink.selectAll("path")
            .data(links, d => d.target.id);
  
        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
                const o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });
  
        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("stroke", function(d) {
                if (d.source.data.path == true && d.target.data.path == true) {
                    return COLORS["Current Path"]
                } else {
                    return d.source.data.type ? COLORS[d.source.data.type] : "#EEE"
                }
            })
            .attr("d", diagonal);
  
        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
                const o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            });
    
        // Stash the old positions for transition.
        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
  
    // Do the first update to the initial configuration of the tree — where a number of nodes
    // are open (arbitrarily selected as the root, plus nodes with 7 letters).
    root.x0 = dy / 2;
    root.y0 = 0;

    let chapter = Url.get.chapter;
    if (chapter) {
        let chapter_node = root.descendants().find(descendant => descendant.data.chapter == chapter);
        var path_chapters = root.path(chapter_node).map(node => node.data.chapter);
        path_chapters.push(chapter);
    }

    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        // if (chapter && !path_chapters.find(p_chapter => p_chapter == d.data.chapter)) d.children = null;
        if (chapter && path_chapters.find(p_chapter => p_chapter == d.data.chapter)) d.data.path = true;
    });
  
    update(null, root);
  
    return svg.node();
}

//Initialize legend
const legendItemSize = 20;
const legendSpacing = 4;
const xOffset = 20;
const yOffset = 12;
const legend = d3
    .select('#legend')
    .append('svg')
        .attr("height", "145")
        .selectAll('.legendItem')
        .data(Object.keys(COLORS).map(function (key) {
            return [key, COLORS[key]]
        }));

//Create legend items
legend
    .enter()
    .append('circle')
    .attr('class', 'legendItem')
    .attr("r", 10)
    .attr("fill", d =>  d[1])
    .attr("fill-opacity", 0.8)
    .attr("stroke", d =>  d[1])
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 1)
    .attr('width', legendItemSize)
    .attr('height', legendItemSize)
    .style('fill', d => d[1])
    .attr('transform',
        (d, i) => {
            var x = xOffset;
            var y = yOffset + (legendItemSize + legendSpacing) * i;
            return `translate(${x}, ${y})`;
        }
    );

//Create legend labels
legend
    .enter()
    .append('text')
    .attr("dy", "-.38em")
    .attr("fill", "#FFF")
    .attr("style", "font: 16px sans-serif;")
    .attr('x', xOffset + legendItemSize)
    .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
    .text(d => d[0]); 
