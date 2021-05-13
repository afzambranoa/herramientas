
console.log ("Seguimos con D3")

d3.json ("https://gist.githubusercontent.com/double-thinker/817b155fd4fa5fc865f7b32007bd8744/raw/13068b32f82cc690fb352f405c69c156529ca464/partidos2.json").then (function (datosCompletos){
    
    
    // NUEVA VARIABLE CON LA INFO DE PARTIDOS DEL NUEVO DATASET
    var datosPartidos = datosCompletos.partidos
    
    datos=datosPartidos
    
    console.log ("Ya hemos cargado correctamente los datos")
    var height = 800
    var width = 900
    
    var margin = {
        top: 20,
        botton: 50,
        left: 40,
        right: 50
    }
    
    var escalaX = d3.scaleLinear()
        .domain ([1,10])
        //.range (["0","500"])
       
       .range ([0 + margin.left, width - margin.right])
    
    var escalaY = d3.scaleLinear()
        //.domain ([0, 3000])
        .domain (d3.extent(datos, d => d.votantes))
       // .range (["500","0"])
          .range ([height-margin.botton, 0 + margin.top]) 
    
    // CREAMOS ESCALA COLOR
    
    var escalaColor = d3.scaleLinear()
        .domain(d3.extent(datos, d => d.mediaAutoubicacion)) 
        .range(["red", "blue"]) 
    
    // CREAMOS ESCALA TAMAÑO CIRCULOS
    
    var escala_tamanio = d3.scaleLinear()
        .domain (d3.extent(datos, d=>d.votantes))
        .range ([8,30]) 
    
    
    var elementoSVG = d3.select ("body").append ("svg")
        .attr("width",width)
        .attr("height",height)

    elementoSVG
        .selectAll("circle")
        .data(datos)
        .enter()
        .append("circle")
        
        .attr("cx",d => escalaX(d.mediaAutoubicacion))
        .attr("cy",d => escalaY(d.votantes))
    
        // APLICAR ESCALA COLOR
        .attr ("fill", d => escalaColor(d.mediaAutoubicacion))
    
        //.attr("r",15)
        .attr("r", d => escala_tamanio(d.votantes))
    
    //// EJES
    // VISUALIZAMOS EJE Y
    var ejeY = d3.axisLeft (escalaY)
    
    // PINTAR eje y
    elementoSVG
        .append("g")
        .attr ("transform", "translate (" + margin.left + ",0)")
        .call (ejeY)
    
    /// VISUALIZAMOS EJE X
    var ejeX = d3.axisBottom (escalaX)
    // PONER TICKS
        .ticks (5)
        .tickFormat (d3.format(".3s"))
    
    // PINTAR eje X
    elementoSVG
        .append("g")
        .attr ("transform", "translate (0," + (height - margin.botton/2) + ")")
        .call (ejeX)
    
    //// EJES
    
        
    
    
}                                 
)

