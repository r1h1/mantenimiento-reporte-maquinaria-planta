namespace mantoMaquinariaPlanta.Models
{
    public class Grupo
    {
        public int IdGrupo { get; set; }
        public string Nombre { get; set; }
        public int IdArea { get; set; }
        public string? Descripcion { get; set; }
        public bool Estado { get; set; }
    }
}