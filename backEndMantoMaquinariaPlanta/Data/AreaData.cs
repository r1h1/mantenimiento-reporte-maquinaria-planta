using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class AreaData
    {
        private readonly string _conexion;

        public AreaData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todas las áreas activas
        public async Task<List<Area>> Lista()
        {
            List<Area> lista = new List<Area>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerAreas", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Area
                        {
                            IdArea = reader.GetInt32("IdArea"),
                            Nombre = reader.GetString("Nombre"),
                            Ubicacion = reader["Ubicacion"] as string,
                            IdPlanta = reader["IdPlanta"] as int?,
                            Descripcion = reader["Descripcion"] as string,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un área por ID
        public async Task<Area?> ObtenerId(int id)
        {
            Area? area = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerAreaPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdArea", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        area = new Area
                        {
                            IdArea = reader.GetInt32("IdArea"),
                            Nombre = reader.GetString("Nombre"),
                            Ubicacion = reader["Ubicacion"] as string,
                            IdPlanta = reader["IdPlanta"] as int?,
                            Descripcion = reader["Descripcion"] as string,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return area;
        }

        // Crear una nueva área
        public async Task<int> Crear(Area area)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearArea", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", area.Nombre);
                cmd.Parameters.AddWithValue("@Ubicacion", (object)area.Ubicacion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@IdPlanta", (object)area.IdPlanta ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Descripcion", (object)area.Descripcion ?? DBNull.Value);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0); // Obtiene el ID retornado por SCOPE_IDENTITY()
                    }
                }
            }
            return nuevoId;
        }

        // Actualizar un área existente
        public async Task<bool> Editar(Area area)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarArea", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdArea", area.IdArea);
                cmd.Parameters.AddWithValue("@Nombre", area.Nombre);
                cmd.Parameters.AddWithValue("@Ubicacion", (object)area.Ubicacion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@IdPlanta", (object)area.IdPlanta ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Descripcion", (object)area.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", area.Estado);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        int filasAfectadas = reader.GetInt32(0);
                        return filasAfectadas > 0;
                    }
                }
            }
            return false;
        }

        // Eliminar un área (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarArea", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdArea", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        int filasAfectadas = reader.GetInt32(0);
                        return filasAfectadas > 0;
                    }
                }
            }
            return false;
        }
    }
}