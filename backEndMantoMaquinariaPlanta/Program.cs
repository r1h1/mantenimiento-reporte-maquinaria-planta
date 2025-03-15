using mantoMaquinariaPlanta.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Data.SqlClient;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// **Cargar configuración desde appsettings.json**
builder.Configuration.AddJsonFile("appsettings.json");

// **Obtener clave secreta para JWT**
var secretKey = builder.Configuration["settings:secretkey"];

if (string.IsNullOrEmpty(secretKey))
{
    throw new Exception("Secret key not found in appsettings.json");
}

var keyBytes = Encoding.UTF8.GetBytes(secretKey);

// **Configurar autenticación JWT**
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(config =>
    {
        config.RequireHttpsMetadata = false; // 🔹 Permitir HTTP en desarrollo
        config.SaveToken = true;
        config.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// **CONFIGURAR CORS** (Permitir todas las políticas necesarias)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PoliticaGlobal", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

// **REGISTRO DE SERVICIOS PARA INYECCIÓN DE DEPENDENCIAS**
builder.Services.AddScoped<AreaData>();
builder.Services.AddScoped<AsignacionData>();
builder.Services.AddScoped<AuthData>();
builder.Services.AddScoped<FinalizacionData>();
builder.Services.AddScoped<GrupoData>();
builder.Services.AddScoped<GrupoUsuarioData>();
builder.Services.AddScoped<MaquinaData>();
builder.Services.AddScoped<MenuData>();
builder.Services.AddScoped<PlantaData>();
builder.Services.AddScoped<ReporteData>();
builder.Services.AddScoped<RolData>();
builder.Services.AddScoped<TipoMaquinaData>();
builder.Services.AddScoped<UsuarioData>();

// **Agregar seguridad en headers HTTP**
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// **Verificar Conexión a la Base de Datos antes de iniciar**
try
{
    var connectionString = builder.Configuration.GetConnectionString("CadenaSQL");
    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();
        Console.WriteLine("Conexión a la BD exitosa.");
    }
}
catch (Exception ex)
{
    Console.WriteLine("Error al conectar con la base de datos: " + ex.Message);
}

// **Construcción de la app**
var app = builder.Build();

// **APLICAR MIDDLEWARES EN EL ORDEN CORRECTO**
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// **FORWARDED HEADERS PARA PROXY O NGINX**
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseRouting();

// **AHORA CORS ESTÁ ENTRE UseRouting() y UseAuthorization()**
app.UseCors("PoliticaGlobal");

app.UseAuthentication();
app.UseAuthorization();

// **Middleware para capturar errores y mostrar detalles**
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var errorMessage = exception?.Message ?? "Error desconocido en el servidor.";

        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = errorMessage });
    });
});

// **Mapear controladores**
app.MapControllers();

// **Iniciar la aplicación**
app.Run();
