console.log("Inicio")

function fun_datos_covit_esp() {
    // Carga de los datos para representar el mapa
   // d3.json("https://raw.githubusercontent.com/deldersveld/topojson/master/countries/spain/spain-comunidad-with-canary-islands.json")
   d3.json("E:/muertos_por_coronavirus_e.json")
   .then (function (datos_hospital) {
        window.esp = datos_hospital
        console.log(datos_hospital)
        console.log("Datos mapa cargados")
    })
}

function fun_datos_comunidad() {
    d3.dsv(";","https://raw.githubusercontent.com/amadorgarcia01/unir/master/covit_casos_diarios_madrid.csv")
    .then (function (datos_comunidad) {
        window.datos_comunidad = datos_comunidad
        console.log("Datos comunidad cargados")})
}

function fun_datos_covit(){
    document.getElementById('loading').style.display = 'none';
    // Carga de los datos con la información de casas de COVIT en España
    d3.dsv(";","https://raw.githubusercontent.com/amadorgarcia01/unir/master/covit_comunidades_autonomas.csv")
    .then (function (datos_covit) {
        
        console.log("Datos Covit cargados")
        
        // Carga de los datos a mostrar en el tooltip del mapa
        datos_mapa = new Map(datos_covit.map(d => [d.code, parseFloat(d['Porcentaje total'])]))

        // Declaración de variables de configuración general de los gráficos
        var height = 800
        var width = 900

        var escalaColor = d3.scaleLinear()
            .domain(d3.extent(datos_covit, d => [parseFloat(d['Porcentaje total'])]))
            .range(["yellow","red"])

        projection = d3.geoMercator()
        // centro del mapa en grados
        .center([0, 37])
        // zoomlevel
        .scale(1900)
        // map-rotation
        .rotate([0,0]);

        color = d3.scaleQuantize([0, 2], d3.schemeBlues[9])

        tooltip = d3.select("body").append("div")
            .attr("class", "svg-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .text("---");

        var path = d3.geoPath().projection(projection);
        
        //Creando nuevo gráfico
        var svgMapa = d3.select("#mapa")
            .append("svg")
            .attr("viewBox", "0 0 1000 700")
            .style("width", width)
            .style("height", height)
            .append("g");

        // Configurando el mapa
        svgMapa
            .selectAll("path")
            .data(topojson.feature(esp, esp.objects.ESP_adm1).features)
            .enter()
            .append("path")
            .attr("fill",d=>escalaColor(datos_mapa.get(d.properties.HASC_1)))
            .attr("d", path)
            //Muestra el ToolTip en el Mapa
            .on("mouseover", function(d){    
                return tooltip.style("visibility", "visible").text(d.properties.NAME_1 + ": " + datos_mapa.get(d.properties.HASC_1));})
            .on("mousemove", function(){
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            //Esconde el ToolTip en el Mapa
            .on("mouseout", function(){
                return tooltip.style("visibility", "hidden");})
            //Llamada a la función de pintar la segunda gráfica
            //.on("click", d => detalle_comunidad("ES.MD"));
            .on("click", d => detalle_comunidad(d.properties.HASC_1));

        svgMapa
            .append("path")
            .datum(topojson.mesh(esp, esp.objects.ESP_adm1, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);

        
        ///////////////////////////////////////////////////////////////
        //Segunda Gráfica
        ///////////////////////////////////////////////////////////////

        // Declaración de variables de configuración general de los gráficos
        var height = 500
        var width = 600
        
        var margin = ({
                top: 20, 
                right: 50, 
                bottom: 40, 
                left: 50})
        
        color = "steelblue"
        
        y = d3.scaleLinear()
            .domain([0,6000])
            //.domain([0, d3.max(datos_covit, d => d.Casos)]).nice()
            .range([height - margin.bottom, 0 + margin.top])
        
        // Función para presentar el gráfico de barras de la comunidad seleccionada
            function detalle_comunidad (comunidad) {
                var divGrafica = document.getElementById('grafica');
                if(typeof divGrafica !== null && divGrafica !== 'undefined' ) {
                    document.getElementById('grafica').innerHTML = "";
                }
                console.log("Inicio Segunda Grafica")
                    
                    // Carga de los datos con la información de casas de COVIT en España
                d3.dsv(";","https://raw.githubusercontent.com/amadorgarcia01/unir/master/covit_casos_diarios_madrid.csv")
                .then (function (datos_comunidad_total) {

                    datos_comunidad = datos_comunidad_total.filter(function(d){ return d.Comunidad == comunidad; })

                    console.log("Datos comunidad cargados")

                    x = d3.scaleBand()
                        .domain(d3.range(datos_comunidad.length))
                        .range([margin.left, width - margin.right])
                        .padding(0.1)

                    xAxis = g => g
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .call(d3.axisBottom(x).tickFormat(i => datos_comunidad[i].Periodo).tickSizeOuter(0))

                    //Creando nuevo gráfico
                    var svgBarra = d3.select("#grafica")
                        .append("svg")
                        .attr("viewBox", [0, 0, width, height])
                        .style("width", width)
                        .style("height", height)
                        .append("g");

                    svgBarra
                        .append("g")
                        //.attr("transform","translate (0," + (height - margin.bottom+5) + ")")
                        .attr("fill", color)
                        .selectAll("rect")
                        .data(datos_comunidad)
                        .join("rect")
                        .attr("x", (d, i) => x(i))
                        .attr("y", d => y(d.Casos))
                        .attr("height", d => y(0) - y(d.Casos))
                        .attr("width", x.bandwidth());

                    svgBarra.append("g")
                        .call(xAxis);

                    svgBarra.selectAll("text")
                        .attr("transform", "translate(-10,10)rotate(-90)")
                        .style("text-anchor", "end")
                        .data(datos_comunidad)
                        .enter()
                        .append("text")
                        .text(function(d){return d;})
                        .attr("text-anchor", "middle")
                        .attr("x", function(d, i){
                            return i * ((ancho-2*margen)/datos.length)+((ancho-2*margen)/datos.length)/2;})
                        .attr("y", function(d){return -y(d) + 14;})
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "13px")
                        .attr("fill", "white");

                    yAxis = g => g
                        .attr("transform","translate (" + margin.left + ",0)")
                        //.attr("transform", `translate(${margin.left},0)`)
                        .call(d3.axisLeft(y).ticks(null, datos_comunidad.format))
                        //.call(g => g.select(".domain").remove())
                        .call(g => g.append("text")
                        .attr("x", -margin.left)
                        .attr("y", 10)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "start")
                        .text(datos_covit.y))

                        svgBarra.append("g")
                        .call(yAxis);

                })
            }
    })
}

fun_datos_covit_esp()
fun_datos_comunidad()
setTimeout(function() {
    fun_datos_covit()
  }, 1500);
    
