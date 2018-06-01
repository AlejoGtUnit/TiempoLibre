/*Inicio JS Eventos - Agenda - Tiempo Libre*/
var eventosPorPagina = 6;

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
    var jqxhr = $.get(urlService, { inicio: inicio_in, fin: fin_in  })
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
                    $(".card-evento-lista[data-rownumber=" + rowNumber + "] .opciones-compartir").toggle();
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
/*Fin JS Eventos - Agenda - Tiempo Libre*/