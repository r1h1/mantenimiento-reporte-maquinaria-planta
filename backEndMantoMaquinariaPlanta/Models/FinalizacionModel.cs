namespace mantoMaquinariaPlanta.Models
{
    public class Finalizacion
    {
        public int IdFinalizacion { get; set; }
        public int IdAsignacion { get; set; }
        public DateTime FechaFinTrabajo { get; set; }
        public string DescripcionSolucion { get; set; }
        public string EstadoFinalizado { get; set; }
        public bool Estado { get; set; }
    }
}