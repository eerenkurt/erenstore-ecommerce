using Application;
using Application.Interfaces;
using Infrastructure.Context;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi;
using WebAPI.Middlewares;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("ErenStorePostgres");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IProductRepository, ProductRepository>();

builder.Services.AddApplicationServices();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ErenStore API", Version = "v1" });

    c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer", 
        BearerFormat = "JWT",
        Description = "JWT Token girmek için bu kutuya sadece token'ınızı yapıştırın."
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer")] = []
    });
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();   
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(opt => opt.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
