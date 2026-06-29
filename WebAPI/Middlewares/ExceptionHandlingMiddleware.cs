using System.Net;
using System.Text.Json;

namespace WebAPI.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // isteğin normal akışına devam etmesini sağlar
            await _next(context);
        }
        catch (Exception ex)
        {
            // uygulamanın herhangi bir yerinde hata fırlarsa direkt buraya düşer
            _logger.LogError(ex, "Bir hata oluştu: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        // hatanın türüne göre HTTP durum kodunu belirliyoruz
        var statusCode = exception switch
        {
            UnauthorizedAccessException => HttpStatusCode.Unauthorized, // 401
            KeyNotFoundException => HttpStatusCode.NotFound,             // 404
            InvalidOperationException => HttpStatusCode.BadRequest,      // 400
            _ => HttpStatusCode.InternalServerError                      // diğer her şey için 500
        };

        context.Response.StatusCode = (int)statusCode;

        // dışarıya döneceğimiz temiz ve profesyonel hata paketi
        var response = new
        {
            statusCode = context.Response.StatusCode,
            message = exception.Message, // bizim fırlattığımız mesaj buraya gelir
            detailed = exception.InnerException?.Message // varsa iç hata mesajı
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}