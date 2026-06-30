using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;
using System.Security.Claims;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Kullanıcı bilgisi token'dan alınamadı." });
            }

            int customerId = int.Parse(userIdClaim.Value);

            var result = await _orderService.CreateOrderAsync(customerId, dto);

            if (!result)
            {
                return BadRequest(new { message = "Sipariş oluşturulurken bir hata meydana geldi." });
            }

            return Ok(new { message = "Siparişiniz başarıyla alındı!" });
        }
        
        [HttpGet("my-orders")]
        [Authorize(Roles = "Customer")] // sadece müşteriler kendi siparişlerini görebilir
        public async Task<IActionResult> GetMyOrders()
        {
            // token içinden, isteği atan mevcut kullanıcının idsini çekiyoruz
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Kullanıcı bilgisi token'dan alınamadı." });
            }

            int customerId = int.Parse(userIdClaim.Value);

            // servise gidip sadece bu müşterinin siparişlerini getiriyoruz
            var orders = await _orderService.GetOrdersByCustomerIdAsync(customerId);
    
            return Ok(orders);
        }

        [HttpGet("all-orders")]
        [Authorize(Roles = "Admin")] // sistemdeki tüm siparişleri sadece admin görebilir
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }
    }
}