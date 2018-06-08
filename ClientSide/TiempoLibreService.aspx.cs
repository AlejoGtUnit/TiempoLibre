<%@ Register src="~/CMSWebParts/DataSources/QueryDataSource.ascx" tagname="QueryDataSource" tagprefix="uc1" %>
<%@ Register Src="~/CMSWebParts/Viewers/Basic/BasicRepeater.ascx" TagPrefix="uc1" TagName="BasicRepeater" %>
 
<script runat="server">
protected override void OnLoad(EventArgs e)
{
    base.OnLoad(e);
    Response.Clear();
  
    Response.ContentType = "application/json; charset=utf-8";
    Response.AddHeader("Access-Control-Allow-Origin","*");
  
    int top;
    if (string.IsNullOrEmpty(Request.QueryString["top"]) || !int.TryParse(Request.QueryString["top"],out top))
      top = 250;
    
    int inicio;
    if (string.IsNullOrEmpty(Request.QueryString["inicio"]) || !int.TryParse(Request.QueryString["inicio"],out inicio))
      inicio = 0;
  
    int fin;
    if (string.IsNullOrEmpty(Request.QueryString["fin"]) || !int.TryParse(Request.QueryString["fin"],out fin))
      fin = 0;
  
    int categoria;
    if (string.IsNullOrEmpty(Request.QueryString["categoria"]) || !int.TryParse(Request.QueryString["categoria"],out categoria))
      categoria = default(int);
    
    var zona = this.FindZone("zoneData");
    if (zona != null)
    {
        CMSWebParts_DataSources_QueryDataSource qds = (CMSWebParts_DataSources_QueryDataSource)zona.FindControl("QDS_Eventos_TiempoLibre");
        if (qds != null)
        {
            qds.QueryName = "CMS.EventoTiempoLibre.selecteventos_temp_rownumber_service";
            qds.OrderBy = "FechaInicio ASC";
            qds.Columns = "Titulo,Resumen,Categorias,FechaInicio,FechaFinal,MostrarFechaFinal,Thumbnail,DocumentUrlPath";
            qds.WhereCondition = "1=1";
            if (categoria != default(int))
              qds.WhereCondition += string.Format(" AND Categorias LIKE '%{0}%'", categoria);
            qds.SelectTopN = top;
        }
    
        CMSWebParts_Viewers_Basic_BasicRepeater repetidor = (CMSWebParts_Viewers_Basic_BasicRepeater)zona.FindControl("BR_Eventos_TiempoLibre");
        if (repetidor != null)
        {
            if (repetidor.DataSourceControl != null)
            {
                if (repetidor.DataSourceControl.DataSource != null)
                {
                    System.Data.DataSet datos = (System.Data.DataSet)repetidor.DataSourceControl.DataSource;
                    if (datos.Tables.Count > 0)
                    {
                        System.Data.DataTable tablaDatos = datos.Tables[0];
                        var anonimosFilas = new System.Collections.Generic.List<object>();
                        if (tablaDatos.Rows.Count > 0)
                        {                          
                            foreach (System.Data.DataRow fila in tablaDatos.Select(string.Format("RowNumber >= {0} AND RowNumber <= {1}", inicio, fin)))
                            {
                                var dataRowView = tablaDatos.DefaultView.Cast<System.Data.DataRowView>().FirstOrDefault(a => a.Row == fila);
                                anonimosFilas.Add(this.ObtenerObjetoEvento(fila, dataRowView));
                            }
                        }
                        var cadenaJson = Newtonsoft.Json.JsonConvert.SerializeObject(new {
                            top = top,
                            totalEventos = tablaDatos.Rows.Count,
                            inicio = inicio,
                            fin = fin,
                            eventos = anonimosFilas 
                        });
                        Response.Write(cadenaJson);  
                    }
                }
            }
        }
    }
    Response.End();
}
                                                       
public object ObtenerObjetoEvento(System.Data.DataRow fila, System.Data.DataRowView dataRowView)      
{
    object resultado = null;
    try
    {
        if (fila != null)
        {
            var rowNumberValor = fila["rowNumber"].ToString();
            var tituloValor = fila["Titulo"].ToString();
            var tituloLimitedValor = CMS.GlobalHelper.TextHelper.LimitLength(fila["Titulo"].ToString(), 60, "...", true);
            var resumenValor = fila["Resumen"].ToString();
            var resumenLimitedValor = CMS.GlobalHelper.TextHelper.LimitLength(fila["Resumen"].ToString(), 80, "...", true);
            var urlEventoValor = fila["DocumentUrlPath"].ToString();
            var urlEventoCompletaValor = CMS.GlobalHelper.URLHelper.GetAbsoluteUrl(string.Format("~{0}", fila["DocumentUrlPath"]));
            var fechaInicioValor = fila["fechaInicio"] != null ? ObtenerFecha(fila["fechaInicio"]) : string.Empty;
            var fechaFinalValor = fila["fechaFinal"] != null ? ObtenerFecha(fila["fechaFinal"]) : string.Empty;
            var mostrarFechaFinal = bool.Parse(fila["mostrarFechaFinal"].ToString());
            //var imagenSmallValor = GSIFunctions.GetGSIImageURLGUID_WithResizeCrop(CMS.GlobalHelper.ValidationHelper.GetGuid(fila["Thumbnail"].ToString(), Guid.Empty), "cms.eventotiempolibre.pl_tiempolibreevento_grande", "383", "216", string.Empty);
            //var imagenSmall4_3Valor = GSIFunctions.GetGSIImageURLGUID_WithResizeCrop(CMS.GlobalHelper.ValidationHelper.GetGuid(fila["Thumbnail"].ToString(), Guid.Empty), "cms.eventotiempolibre.pl_tiempolibreevento_grande", "288", "216", string.Empty);
            var imagenSmallValor = GSIFunctions.GetGSIImageURLGUID_WithResizeCrop(CMS.GlobalHelper.ValidationHelper.GetGuid(fila["Thumbnail"].ToString(), Guid.Empty), "cms.eventotiempolibre.pl_tiempolibreevento_grande", "383", "216", string.Empty);
            var imagenSmall4_3Valor = GSIFunctions.GetGSIImageURLGUID_WithResizeCrop(CMS.GlobalHelper.ValidationHelper.GetGuid(fila["Thumbnail"].ToString(), Guid.Empty), "cms.eventotiempolibre.pl_tiempolibreevento_grande", "288", "216", string.Empty);
            var categoriasValor = fila["Categorias"] != null ? ObtenerCategorias(fila["Categorias"].ToString()) : string.Empty;
                              
            resultado = new {
                rowNumber = rowNumberValor,
                titulo = tituloValor,
                tituloLimited = tituloLimitedValor,
                resumen = resumenValor,
                resumenLimited = resumenLimitedValor,
                urlEvento = urlEventoValor,
                urlEventoCompleta = urlEventoCompletaValor,
                categorias = categoriasValor,
                fechaInicio = fechaInicioValor,
                fechaFinal = fechaFinalValor,
                mostrarFechaFinal = mostrarFechaFinal,
                imagenSmall = imagenSmallValor,
                imagenSmall4_3 = imagenSmall4_3Valor
            };
        }
    }
    catch(Exception ex)
    {
        resultado = new { error = ex.Message };
    }
    return resultado;
}
                         
protected string ObtenerCategorias(string entrada)
{
    var resultado = string.Empty;
    if (!string.IsNullOrEmpty(entrada))
    {
        var codigosCategorias = entrada.Split('|');
        foreach (var codigoCategoria in codigosCategorias)
        {
            resultado += string.Format("{0}{1}", (string.IsNullOrEmpty(resultado) ? string.Empty : ", "), Categoria(int.Parse(codigoCategoria)));
        }
    }
    return resultado;
}
                      
protected string Categoria(int codigo)
{
    var resultado = string.Empty;
    string[] categorias = { "Cine y teatro", "Actividades familiares", "Conciertos", "Deportes", "Expediciones y viajes", "Gastronomia", "Exposiciones y convenciones", "Vida noctura" };
    if (codigo <= categorias.Length)
    {
        resultado = categorias[codigo - 1];
    }
    return resultado;
}
                  
protected object ObtenerFecha(object entrada)
{
    object resultado = null;
    DateTime fecha = CMS.GlobalHelper.ValidationHelper.GetDateTime(entrada, new DateTime(1, 1, 1));
    if (fecha != new DateTime(1, 1, 1))
    {
        resultado = new
        {
            valorCompleto = entrada.ToString(),
            sinHora = fecha.ToShortDateString(),
            dia = fecha.Day,
            mes = new
            {
                mes = fecha.Month,
                nombre = PLFunctions.GetMonthName(fecha.Month).Substring(0, 3)
            },
            anio = fecha.Year,
            hora = fecha.Hour.ToString().PadLeft(2, '0'),
            minuto = fecha.Minute.ToString().PadLeft(2, '0')
        };
    }
    return resultado;
}
</script>

<cms:CMSWebPartZone ZoneID="zoneData" runat="server" />