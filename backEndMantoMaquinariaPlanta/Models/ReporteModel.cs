namespace mantoMaquinariaPlanta.Models
{
    public class Reporte
    {
        public int IdReporte { get; set; }
        public int IdArea { get; set; }
        public int IdMaquina { get; set; }
        public string Impacto { get; set; }
        public bool PersonasLastimadas { get; set; }
        public bool DanosMateriales { get; set; }
        public DateTime FechaReporte { get; set; }
        public string Titulo { get; set; }
        public string? MedidasTomadas { get; set; }
        public string? Descripcion { get; set; }
        public string EstadoReporte { get; set; }
        public bool Estado { get; set; }
    }
}
