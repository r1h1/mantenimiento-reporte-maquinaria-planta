using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class TipoMaquinaData
    {
        private readonly string _conexion;

        public TipoMaquinaData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los tipos de máquinas activas
        public async Task<List<TipoMaquina>> Lista()
        {
            List<TipoMaquina> lista = new List<TipoMaquina>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerTipoMaquinas", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new TipoMaquina
                        {
                            IdTipoMaquina = reader.GetInt32("IdTipoMaquina"),
                            Nombre = reader.GetString("Nombre"),
                            Descripcion = reader["Descripcion"] as string,
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un tipo de máquina por ID
        public async Task<TipoMaquina?> ObtenerId(int id)
        {
            TipoMaquina? tipoMaquina = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerTipoMaquinaPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdTipoMaquina", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        tipoMaquina = new TipoMaquina
                        {
                            IdTipoMaquina = reader.GetInt32("IdTipoMaquina"),
                            Nombre = reader.GetString("Nombre"),
                            Descripcion = reader["Descripcion"] as string,
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return tipoMaquina;
        }

        // Crear un tipo de máquina y devolver su ID
        public async Task<int> Crear(TipoMaquina tipoMaquina)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearTipoMaquina", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", tipoMaquina.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", (object)tipoMaquina.Descripcion ?? DBNull.Value);

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

        // Editar un tipo de máquina
        public async Task<bool> Editar(TipoMaquina tipoMaquina)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarTipoMaquina", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdTipoMaquina", tipoMaquina.IdTipoMaquina);
                cmd.Parameters.AddWithValue("@Nombre", tipoMaquina.Nombre);
                cmd.Parameters.AddWithValue("@Descripcion", (object)tipoMaquina.Descripcion ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Estado", tipoMaquina.Estado);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar (desactivar) un tipo de máquina
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarTipoMaquina", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdTipoMaquina", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
