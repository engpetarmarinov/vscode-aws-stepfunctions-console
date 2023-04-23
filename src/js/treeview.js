function renderTree(data) {
    // Define dimensions of the SVG container
    const width = 600;
    const height = 600;

    const root = d3.hierarchy(data);

    // Create a function to create a node and its children
    const treeLayout = d3.tree().size([width, height]);
    treeLayout(root);

    const svg = d3.select("#tree-container")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(50, 50)");

    // Draw links between the nodes
    const link = svg.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d => {
            return `M${d.x},${d.y}C${d.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${d.parent.y}`;
        });

    // Create groups for nodes
    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", d => {
            return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Draw circles for nodes
    node.append("circle")
        .attr("r", 10);

    // Add text to nodes
    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -20 : 20)
        .text(d => d.data.name);

    // Add mouseover and mouseout events to highlight nodes
    node.on("mouseover", function () {
        d3.select(this).select("circle").classed("highlighted", true);
    })
    .on("mouseout", function () {
        d3.select(this).select("circle").classed("highlighted", false);
    });
}
