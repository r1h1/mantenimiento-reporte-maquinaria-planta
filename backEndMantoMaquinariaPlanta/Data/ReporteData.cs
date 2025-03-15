using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class ReporteData
    {
        private readonly string _conexion;

        public ReporteData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los reportes activos
        public async Task<List<Reporte>> Lista()
        {
            List<Reporte> lista = new List<Reporte>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerReportes", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Reporte
                        {
                            IdReporte = reader.GetInt32("IdReporte"),
                            IdArea = reader.GetInt32("IdArea"),
                            IdMaquina = reader.GetInt32("IdMaquina"),
                            Impacto = reader.GetString("Impacto"),
                            PersonasLastimadas = reader.GetBoolean("PersonasLastimadas"),
                            DanosMateriales = reader.GetBoolean("DanosMateriales"),
                            FechaReporte = reader.GetDateTime("FechaReporte"),
                            Titulo = reader.GetString("Titulo"),
                            MedidasTomadas = reader["MedidasTomadas"] as string,
                            Descripcion = reader["Descripcion"] as string,
                            EstadoReporte = reader.GetString("EstadoReporte"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un reporte por ID
        public async Task<Reporte?> ObtenerId(int id)
        {
            Reporte? reporte = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerReportePorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdReporte", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        reporte = new Reporte
                        {
                            IdReporte = reader.GetInt32("IdReporte"),
                            IdArea = reader.GetInt32("IdArea"),
                            IdMaquina = reader.GetInt32("IdMaquina"),
                            Impacto = reader.GetString("Impacto"),
                            PersonasLastimadas = reader.GetBoolean("PersonasLastimadas"),
                            DanosMateriales = reader.GetBoolean("DanosMateriales"),
                            FechaReporte = reader.GetDateTime("FechaReporte"),
                            Titulo = reader.GetString("Titulo"),
                            MedidasTomadas = reader["MedidasTomadas"] as string,
                            Descripcion = reader["Descripcion"] as string,
                            EstadoReporte = reader.GetString("EstadoReporte"),
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return reporte;
        }

        // Crear un nuevo reporte
        public async Task<int> Crear(Reporte reporte)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearReporte", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdArea", reporte.IdArea);
                cmd.Parameters.AddWithValue("@IdMaquina", reporte.IdMaquina);
                cmd.Parameters.AddWithValue("@Impacto", reporte.Impacto);
                cmd.Parameters.AddWithValue("@PersonasLastimadas", reporte.PersonasLastimadas);
                cmd.Parameters.AddWithValue("@DanosMateriales", reporte.DanosMateriales);
                cmd.Parameters.AddWithValue("@Titulo", reporte.Titulo);
                cmd.Parameters.AddWithValue("@MedidasTomadas", (object)reporte.MedidasTomadas ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Descripcion", (object)reporte.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@EstadoReporte", reporte.EstadoReporte);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0);
                    }
                }
            }
            return nuevoId;
        }

        // Editar un reporte
        public async Task<bool> Editar(Reporte reporte)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarReporte", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdReporte", reporte.IdReporte);
                cmd.Parameters.AddWithValue("@IdArea", reporte.IdArea);
                cmd.Parameters.AddWithValue("@IdMaquina", reporte.IdMaquina);
                cmd.Parameters.AddWithValue("@Impacto", reporte.Impacto);
                cmd.Parameters.AddWithValue("@PersonasLastimadas", reporte.PersonasLastimadas);
                cmd.Parameters.AddWithValue("@DanosMateriales", reporte.DanosMateriales);
                cmd.Parameters.AddWithValue("@Titulo", reporte.Titulo);
                cmd.Parameters.AddWithValue("@MedidasTomadas", (object)reporte.MedidasTomadas ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Descripcion", (object)reporte.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@EstadoReporte", reporte.EstadoReporte);
                cmd.Parameters.AddWithValue("@Estado", reporte.Estado);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar un reporte (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarReporte", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdReporte", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
