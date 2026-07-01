using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using Application.DTOs;
using System.Security.Claims;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrder()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Kullanıcı bilgisi token'dan alınamadı." });
            }

            int customerId = int.Parse(userIdClaim.Value);

            var result = await _orderService.CreateOrderAsync(customerId);

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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Kullanıcı bilgisi token'dan alınamadı." });
            }

            int customerId = int.Parse(userIdClaim.Value);

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
        
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Seller")] // sipariş durumunu satıcı veya admin güncelleyebilir
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateDto)
        {
            // işi servise devrediyoruz hata olursa ExceptionHandlingMiddleware yakalayacak
            await _orderService.UpdateOrderStatusAsync(id, updateDto);

            return NoContent(); 
        }
    }
}