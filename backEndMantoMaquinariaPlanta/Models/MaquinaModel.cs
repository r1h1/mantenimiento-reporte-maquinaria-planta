namespace mantoMaquinariaPlanta.Models
{
    public class Maquina
    {
        public int IdMaquina { get; set; }
        public string NombreCodigo { get; set; }
        public int IdTipoMaquina { get; set; }
        public int? IdArea { get; set; }
        public int? IdPlanta { get; set; }
        public bool Estado { get; set; }
    }
}
