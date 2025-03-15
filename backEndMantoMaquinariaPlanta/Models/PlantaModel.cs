namespace mantoMaquinariaPlanta.Models
{
    public class Planta
    {
        public int IdPlanta { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public string UbicacionYDireccion { get; set; }
        public bool Estado { get; set; }
    }
}