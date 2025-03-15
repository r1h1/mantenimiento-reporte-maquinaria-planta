using mantoMaquinariaPlanta.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Cargar configuración desde appsettings.json
builder.Configuration.AddJsonFile("appsettings.json");

// Obtener clave secreta para JWT
var secretKey = builder.Configuration["settings:secretkey"];
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

// Configurar autenticación JWT sin validar Issuer ni Audience
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(config =>
    {
        config.RequireHttpsMetadata = true;
        config.SaveToken = true;
        config.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,  // No validar Issuer
            ValidateAudience = false,  // No validar Audience
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// **CORS CONFIGURADO**
builder.Services.AddCors(options =>
{
    options.AddPolicy("AbiertoParaTodos", app =>
    {
        app.AllowAnyOrigin()
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

// Agregar seguridad en headers HTTP
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Construcción de la app
var app = builder.Build();

// **APLICAR MIDDLEWARES EN EL ORDEN CORRECTO**
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseHsts();

// **FORWARDED HEADERS PARA PROXY O NGINX**
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// **APLICAR CORS DESPUÉS DE UseRouting()**
app.UseRouting();
app.UseCors("AbiertoParaTodos");

// **AUTENTICACIÓN Y AUTORIZACIÓN EN EL ORDEN CORRECTO**
app.UseAuthentication();
app.UseAuthorization();

// Middleware para evitar exposición de errores en producción
app.UseExceptionHandler("/error");

// **ENRUTAMIENTO Y CONTROLADORES**
app.MapControllers();

app.Run();
