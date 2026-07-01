using Application.Interfaces;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddMaps(Assembly.GetExecutingAssembly()));
        services.AddScoped<IProductService, ProductManager>();
        services.AddScoped<IAuthService, AuthManager>();
        services.AddScoped<IOrderService, OrderManager>();
        services.AddScoped<ICartService, CartManager>();
        return services;
    }
}