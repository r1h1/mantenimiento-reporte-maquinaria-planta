namespace mantoMaquinariaPlanta.Models
{
    public class TipoMaquina
    {
        public int IdTipoMaquina { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public bool Estado { get; set; }
    }
}