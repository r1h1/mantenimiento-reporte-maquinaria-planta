using mantoMaquinariaPlanta.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace mantoMaquinariaPlanta.Data
{
    public class MenuData
    {
        private readonly string _conexion;

        public MenuData(IConfiguration configuration)
        {
            _conexion = configuration.GetConnectionString("CadenaSQL")!;
        }

        // Obtener todos los menús activos
        public async Task<List<Menu>> Lista()
        {
            List<Menu> lista = new List<Menu>();

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerMenus", con);
                cmd.CommandType = CommandType.StoredProcedure;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lista.Add(new Menu
                        {
                            IdMenu = reader.GetInt32("IdMenu"),
                            Nombre = reader.GetString("Nombre"),
                            RutaHTML = reader.GetString("RutaHTML"),
                            Estado = reader.GetBoolean("Estado")
                        });
                    }
                }
            }
            return lista;
        }

        // Obtener un menú por ID
        public async Task<Menu?> ObtenerId(int id)
        {
            Menu? menu = null;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ObtenerMenuPorId", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdMenu", id);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        menu = new Menu
                        {
                            IdMenu = reader.GetInt32("IdMenu"),
                            Nombre = reader.GetString("Nombre"),
                            RutaHTML = reader.GetString("RutaHTML"),
                            Estado = reader.GetBoolean("Estado")
                        };
                    }
                }
            }
            return menu;
        }

        // Crear un nuevo menú
        public async Task<int> Crear(Menu menu)
        {
            int nuevoId = 0;

            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_CrearMenu", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Nombre", menu.Nombre);
                cmd.Parameters.AddWithValue("@RutaHTML", menu.RutaHTML);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        nuevoId = reader.GetInt32(0); // Retorna el ID del nuevo menú
                    }
                }
            }
            return nuevoId;
        }

        // Actualizar un menú existente
        public async Task<bool> Editar(Menu menu)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_ActualizarMenu", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@IdMenu", menu.IdMenu);
                cmd.Parameters.AddWithValue("@Nombre", menu.Nombre);
                cmd.Parameters.AddWithValue("@RutaHTML", menu.RutaHTML);
                cmd.Parameters.AddWithValue("@Estado", menu.Estado);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }

        // Eliminar un menú (desactivación lógica)
        public async Task<bool> Eliminar(int id)
        {
            using (var con = new SqlConnection(_conexion))
            {
                await con.OpenAsync();
                SqlCommand cmd = new SqlCommand("sp_EliminarMenu", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@IdMenu", id);

                int filasAfectadas = await cmd.ExecuteNonQueryAsync();
                return filasAfectadas > 0;
            }
        }
    }
}
