@@ .. @@
           <div class="order-details">
             <h4>Shipping Address:</h4>
             <p>
-              ${orderData.shipping?.firstName || ''} ${orderData.shipping?.lastName || ''}<br>
-              ${orderData.shipping?.address || ''}<br>
-              ${orderData.shipping?.city || ''}, ${orderData.shipping?.state || ''} ${orderData.shipping?.zipCode || ''}
+              ${orderData.shippingInfo?.firstName || orderData.shipping?.firstName || ''} ${orderData.shippingInfo?.lastName || orderData.shipping?.lastName || ''}<br>
+              ${orderData.shippingInfo?.address || orderData.shipping?.address || ''}<br>
+              ${orderData.shippingInfo?.city || orderData.shipping?.city || ''}, ${orderData.shippingInfo?.state || orderData.shipping?.state || ''} ${orderData.shippingInfo?.zipCode || orderData.shipping?.zipCode || ''}
             </p>
           </div>