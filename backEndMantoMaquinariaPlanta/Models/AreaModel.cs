namespace mantoMaquinariaPlanta.Models
{
    public class Area
    {
        public int IdArea { get; set; }
        public string Nombre { get; set; }
        public string? Ubicacion { get; set; }
        public int? IdPlanta { get; set; }
        public string? Descripcion { get; set; }
        public bool Estado { get; set; }
    }
}