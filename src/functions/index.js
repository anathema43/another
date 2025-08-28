@@ .. @@
           <div class="order-details">
             <h4>Shipping Address:</h4>
             <p>
               ${orderData.shippingInfo?.firstName || orderData.shipping?.firstName || ''} ${orderData.shippingInfo?.lastName || orderData.shipping?.lastName || ''}<br>
               ${orderData.shippingInfo?.address || orderData.shipping?.address || ''}<br>
               ${orderData.shippingInfo?.city || orderData.shipping?.city || ''}, ${orderData.shippingInfo?.state || orderData.shipping?.state || ''} ${orderData.shippingInfo?.zipCode || orderData.shipping?.zipCode || ''}
             </p>
           </div>
         </div>
         <div class="content">
           <p>Dear ${orderData.shippingInfo?.firstName || 'Customer'},</p>
           <p>Thank you for your order! We're excited to prepare your authentic Darjeeling products.</p>