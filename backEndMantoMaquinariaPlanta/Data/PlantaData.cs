using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class PlantaData
    {
        private readonly string _conexion;

        public PlantaData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todas las plantas activas
        public async Task<List<Planta>> Lista()
        {
            List<Planta> lista = new List<Planta>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerPlantas", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Planta
                        {
                            IdPlanta = reader.GetInt32("IdPlanta"),
                            Nombre = reader.GetString("Nombre"),
                            Descripcion = reader["Descripcion"] as string,
                            UbicacionYDireccion = reader.GetString("UbicacionYDireccion"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener una planta por ID
        public async Task<Planta?> ObtenerId(int id)
        {
            Planta? planta = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerPlantaPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdPlanta", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        planta = new Planta
                        {
                            IdPlanta = reader.GetInt32("IdPlanta"),
                            Nombre = reader.GetString("Nombre"),
                            Descripcion = reader["Descripcion"] as string,
                            UbicacionYDireccion = reader.GetString("UbicacionYDireccion"),
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return planta;
        }

        // Crear una nueva planta
        public async Task<int> Crear(Planta planta)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearPlanta", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", planta.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", (object)planta.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@UbicacionYDireccion", planta.UbicacionYDireccion);

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

        // Editar una planta
        public async Task<bool> Editar(Planta planta)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarPlanta", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdPlanta", planta.IdPlanta);
                cmd.Parameters.AddWithValue("@Nombre", planta.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", (object)planta.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@UbicacionYDireccion", planta.UbicacionYDireccion);
                cmd.Parameters.AddWithValue("@Estado", planta.Estado);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar una planta (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarPlanta", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdPlanta", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
