/*Inicio JS Eventos - Agenda - Tiempo Libre*/
var eventosPorPagina = 6;
var urlsCategorias = 
[   
    { "patron": "/tiempolibre/cine-y-teatro", "codigo": 1 },
    { "patron": "/tiempolibre/actividades-familiares", "codigo": 2 },
    { "patron": "/tiempolibre/conciertos", "codigo": 3},
    { "patron": "/tiempolibre/deportes", "codigo": 4 },
    { "patron": "/tiempolibre/expediciones-y-viajes", "codigo":5 },
    { "patron": "/tiempolibre/gastronomia", "codigo":6 },
    { "patron": "/tiempolibre/exposiciones-y-convenciones", "codigo":7 },
    { "patron": "/tiempolibre/vida-nocturna", "codigo":8 }
];

function obtenerCodigoCategoria()
{
    var resultado = "";
    var href = window.location.href.toLowerCase();
    var categoria = urlsCategorias.find(function(item){
        return (href.indexOf(item.patron) > -1);
    });
    
    if (categoria != undefined && categoria){
        resultado = categoria.codigo;
    }
    return resultado;
}

var urlService = "";
if (window.location.href.indexOf("gnw.prensalibre.com") > -1)
    urlService = "//gnw.prensalibre.com/TiempoLibreService";
else
    urlService = "//gnw.prensalibre.com/TiempoLibreService";

var templateCardEventoLista = $('#template-card-evento-lista').html();
Mustache.parse(templateCardEventoLista);

var templateCardEventoCuadrilla = $('#template-card-evento-cuadrilla').html();
Mustache.parse(templateCardEventoCuadrilla);

$(document).ready(function()
{
    if (!console)
        alert("!console");
    
    console.log("tiempolibre.js document.ready!");
    
    var visualizacion = $.cookie("visualizacion");
    if (visualizacion != undefined && visualizacion)
    {
        console.log("Visualizacion encontrada: " + visualizacion);
        $("#contenedor-tipo-visualizacion").data("visualizacion", visualizacion);
    }
    else
        console.log("No existe preferencia de visualizacion guardada.");

    obtenerEventos(1, eventosPorPagina);
});

function obtenerEventos(inicio_in, fin_in)
{
    var jqxhr = $.get(urlService, { inicio: inicio_in, fin: fin_in, categoria:obtenerCodigoCategoria() })
    .done(function(data) {
        if (data)
        {
            if (data.eventos.length > 0)
            {
                if ($("#wrapper-cards-eventos").html().trim() == ""){
                    var totalEventos = data.totalEventos;
                    console.log("Maximo de eventos disponibles apartir de hoy: " + totalEventos);
                    var totalPaginas = Math.ceil(totalEventos / eventosPorPagina);
                    generarPaginacion(totalPaginas);
                }
                
                $("#wrapper-cards-eventos").html("");
                data.eventos.forEach(function(eventoItem, index)
                {   
                    //Propiedades agregadas para poder usar en MustacheJS
                    eventoItem.mostrarHoraFinalAlFinal = eventoItem.mostrarFechaFinal && (eventoItem.fechaInicio.sinHora == eventoItem.fechaFinal.sinHora);
                    eventoItem.mostrarFechaFinalPorSeparado = eventoItem.mostrarFechaFinal && (eventoItem.fechaInicio.sinHora != eventoItem.fechaFinal.sinHora);
                    eventoDebug = eventoItem;
                    var htmlActualCardsEventos = $("#wrapper-cards-eventos").html();
                    var htmlNuevoCardsEventos = obtenerHtmlCardEvento(eventoItem);
                    $("#wrapper-cards-eventos").html(htmlActualCardsEventos + htmlNuevoCardsEventos);
                });
            }
            else
            {
                $("#wrapper-cards-eventos").html("No existen eventos por el momento.");
                $("#contenedor-paginacion-eventos").hide();
            }
        }
    })
    .fail(function() {
        console.log("obtenerEventos->fail!");
    })
    .always(function() {
        console.log("obtenerEventos->always!");
        
        $(".card-evento-info-lista .img-compartir").on('click', function(){
            var cardEventoListaPadre = $(this).parents(".card-evento-lista");
            if (cardEventoListaPadre != undefined && cardEventoListaPadre){
                var rowNumber = cardEventoListaPadre.data("rownumber");
                if (rowNumber != undefined && rowNumber)
                {
                    $(".card-evento-lista[data-rownumber=" + rowNumber + "] .opciones-compartir").toggle(350);
                }
            }
        });
        
        $(".card-evento-cuadrilla .img-compartir-mobile,.img-compartir-desk").on('click', function(){
            var cardEventoCuadrillaPadre = $(this).parents(".card-evento-cuadrilla");
            if (cardEventoCuadrillaPadre != undefined && cardEventoCuadrillaPadre){
                var rowNumber = cardEventoCuadrillaPadre.data("rownumber");
                if (rowNumber != undefined && rowNumber)
                {
                    $(".card-evento-cuadrilla[data-rownumber=" + rowNumber + "] .opciones-compartir").toggle(350);
                }
            }
        });
    });
}

function obtenerHtmlCardEvento(itemEvento)
{
    var resultado = "";
    var visualizacion = $("#contenedor-tipo-visualizacion").data("visualizacion");
    if (visualizacion != undefined && visualizacion)
    {
        if (visualizacion == "lista")
        {
            resultado = Mustache.render(templateCardEventoLista, itemEvento);
        }
        else if (visualizacion == "cuadrilla")
        {
            resultado = Mustache.render(templateCardEventoCuadrilla, itemEvento);
        }
    }
    return resultado;
}

function lista_visualizacion_click()
{
    $.cookie("visualizacion", "lista");
    $("#contenedor-tipo-visualizacion").data("visualizacion", "lista");
    remostrarCardEventosCargados();
}

function cuadrila_visualizacion_click()
{
    $.cookie("visualizacion", "cuadrilla");
    $("#contenedor-tipo-visualizacion").data("visualizacion", "cuadrilla");
    remostrarCardEventosCargados();
}

function generarPaginacion(paginas)
{
    $("#contenedor-paginacion-eventos").html("");
    for(var x=1; x <= paginas; x++)
    {
        var htmlActual = $("#contenedor-paginacion-eventos").html();
        var claseActiva = (x == 1 ? "paginacion-actual" : "");
        var htmlPagina = "<span id='spanPaginacion" + x + "' class='numero-en-paginacion " + claseActiva + "' data-pagina='" + x + "' onclick='paginacion_click(this)'>" + x + " </span>";
        $("#contenedor-paginacion-eventos").html(htmlActual + htmlPagina);
    }
}

function paginacion_click(instancia)
{
    console.log(instancia);
    var pagina = $(instancia).data("pagina");
    if (pagina != undefined && pagina)
    {
        var fin = pagina * eventosPorPagina;
        var inicio = (fin - eventosPorPagina) + 1;
        
        obtenerEventos(inicio, fin);
    }
    $(".numero-en-paginacion").removeClass("paginacion-actual");
    $(instancia).addClass("paginacion-actual");
    
    $("html, body").animate({ scrollTop: $('#contenedor-tipo-visualizacion').offset().top }, 700);
}

function remostrarCardEventosCargados()
{
    var seleccion = $("span.numero-en-paginacion.paginacion-actual");
    if (seleccion.length > 0){
        var spanPaginaActual = seleccion[0];
        paginacion_click(spanPaginaActual);
    }
}

$("#nav-tiempo-libre #mas-opciones, #sub-nav-tiempo-libre #ocultar span, #nav-tiempo-libre #mas-opciones-mobile").on('click',function(){
   $("#sub-nav-tiempo-libre").toggle();
});

$("#nav-tiempo-libre #opciones-default a, #sub-nav-tiempo-libre a").each(function(a,b) { 
    if (b.href.toLowerCase() == window.location.href.toLowerCase())
      $(b).addClass("active");
});
/*Fin JS Eventos - Agenda - Tiempo Libre*/