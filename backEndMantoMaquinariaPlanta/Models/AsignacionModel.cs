namespace mantoMaquinariaPlanta.Models
{
    public class Asignacion
    {
        public int IdAsignacion { get; set; }
        public int IdReporte { get; set; }
        public int IdGrupo { get; set; }
        public int IdUsuario { get; set; }
        public string EstadoAsignado { get; set; } = "Asignado";
        public DateTime? FechaInicioTrabajo { get; set; }
        public string? DescripcionHallazgo { get; set; }
        public string? MaterialesUtilizados { get; set; }
        public bool Estado { get; set; } = true;
    }
}
