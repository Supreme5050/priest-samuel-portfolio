import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { vendors } from "@/data/vendors";
import { sendChatMessageLive } from "@/services/commerceLiveService";

type ChatMessage = {
  id: string;
  sender: "customer" | "vendor";
  text: string;
  time: string;
};

const COLORS = {
  brand: "#1B4332",
  brandDark: "#0B2F22",
  brandSoft: "#EAF4EE",
  background: "#FAFAF7",
  card: "#FFFFFF",
  text: "#14281D",
  muted: "#667085",
  border: "#E7E5DE",
  accent: "#F59E0B",
  success: "#027A48",
  successSoft: "#ECFDF3",
};

function getCurrentTime() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}

export default function VendorChatScreen() {
  const params = useLocalSearchParams<{
    vendorId?: string;
    vendorName?: string;
    productId?: string;
    productName?: string;
    amount?: string;
  }>();

  const scrollRef = useRef<ScrollView | null>(null);

  const vendorFromData =
    vendors.find((vendor) => vendor.id === params.vendorId) || vendors[0];

  const vendorName = params.vendorName || vendorFromData?.name || "Vendor";
  const productName = params.productName || "";
  const productId = params.productId || "";
  const amount = params.amount || "";

  const [messageText, setMessageText] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "vendor",
      text: `Hello, welcome to ${vendorName}. How can we help you today?`,
      time: "Now",
    },
    {
      id: "welcome-2",
      sender: "vendor",
      text: productName
        ? `You are asking about ${productName}. It is available for order or pickup.`
        : "You can ask about product availability, delivery, pickup, or protected order.",
      time: "Now",
    },
  ]);

  function scrollToBottom() {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  async function sendMessage(customText?: string) {
    const cleanText = (customText || messageText).trim();

    if (!cleanText) return;

    const customerMessage: ChatMessage = {
      id: `customer-${Date.now()}`,
      sender: "customer",
      text: cleanText,
      time: getCurrentTime(),
    };

    const vendorReply: ChatMessage = {
      id: `vendor-${Date.now() + 1}`,
      sender: "vendor",
      text:
        "Thank you. This is the seller chat area. In the real app, the vendor will reply here and the conversation will be saved with the order.",
      time: getCurrentTime(),
    };

    setMessages((currentMessages: ChatMessage[]) => [
      ...currentMessages,
      customerMessage,
      vendorReply,
    ]);

    await sendChatMessageLive({
      vendorId: params.vendorId || vendorFromData?.id || "vendor-crm-kitchen",
      vendorName,
      productId,
      productName,
      senderRole: "customer",
      message: cleanText,
    });

    await sendChatMessageLive({
      vendorId: params.vendorId || vendorFromData?.id || "vendor-crm-kitchen",
      vendorName,
      productId,
      productName,
      senderRole: "vendor",
      message: vendorReply.text,
    });

    setMessageText("");
    scrollToBottom();
  }

  function openProtectedOrder() {
    router.push({
      pathname: "/protected-order",
      params: {
        vendorId: params.vendorId || vendorFromData?.id || "vendor-crm-kitchen",
        vendorName,
        productId,
        productName: productName || "Selected product",
        amount,
      },
    } as any);
  }

  function openVendorDetails() {
    router.push({
      pathname: "/vendor-details",
      params: {
        vendorId: params.vendorId || vendorFromData?.id || "vendor-crm-kitchen",
      },
    } as any);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={23} color={COLORS.text} />
        </Pressable>

        <Pressable style={styles.vendorIdentity} onPress={openVendorDetails}>
          <View style={styles.vendorAvatar}>
            <Ionicons name="storefront" size={22} color={COLORS.card} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.vendorNameRow}>
              <Text style={styles.vendorName} numberOfLines={1}>
                {vendorName}
              </Text>
              <Ionicons name="checkmark-circle" size={15} color={COLORS.success} />
            </View>

            <Text style={styles.vendorStatus} numberOfLines={1}>
              Verified seller · Usually replies soon
            </Text>
          </View>
        </Pressable>
      </View>

      {productName ? (
        <View style={styles.productContextCard}>
          <View style={styles.productIcon}>
            <Ionicons name="bag-handle-outline" size={20} color={COLORS.brand} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.productContextLabel}>Product conversation</Text>
            <Text style={styles.productContextName} numberOfLines={1}>
              {productName}
            </Text>
          </View>

          <Pressable style={styles.orderMiniButton} onPress={openProtectedOrder}>
            <Text style={styles.orderMiniButtonText}>Order</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.brand} />
          <Text style={styles.noticeText}>
            For safety, pay only through the protected order flow. Do not send
            money directly to a vendor outside the app.
          </Text>
        </View>

        {messages.map((message: ChatMessage) => {
          const isCustomer = message.sender === "customer";

          return (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                isCustomer ? styles.customerRow : styles.vendorRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isCustomer ? styles.customerBubble : styles.vendorBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isCustomer ? styles.customerMessageText : styles.vendorMessageText,
                  ]}
                >
                  {message.text}
                </Text>

                <Text
                  style={[
                    styles.messageTime,
                    isCustomer ? styles.customerMessageTime : styles.vendorMessageTime,
                  ]}
                >
                  {message.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.quickReplies}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={styles.quickReply}
            onPress={() => sendMessage("Is this product available now?")}
          >
            <Text style={styles.quickReplyText}>Available?</Text>
          </Pressable>

          <Pressable
            style={styles.quickReply}
            onPress={() => sendMessage("Can you deliver to my location?")}
          >
            <Text style={styles.quickReplyText}>Delivery?</Text>
          </Pressable>

          <Pressable
            style={styles.quickReply}
            onPress={() => sendMessage("Where can I pick this up?")}
          >
            <Text style={styles.quickReplyText}>Pickup?</Text>
          </Pressable>

          <Pressable
            style={styles.quickReply}
            onPress={() => sendMessage("I want to use protected order.")}
          >
            <Text style={styles.quickReplyText}>Protected order</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Message vendor..."
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            multiline
          />
        </View>

        <Pressable style={styles.sendButton} onPress={() => sendMessage()}>
          <Ionicons name="send" size={20} color={COLORS.card} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === "android" ? 22 : 58,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  vendorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  vendorName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    maxWidth: "86%",
  },
  vendorStatus: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  productContextCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  productIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  productContextLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  productContextName: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  orderMiniButton: {
    borderRadius: 14,
    backgroundColor: COLORS.brand,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  orderMiniButtonText: {
    color: COLORS.card,
    fontSize: 12,
    fontWeight: "900",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  noticeBox: {
    borderRadius: 18,
    backgroundColor: COLORS.successSoft,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  noticeText: {
    flex: 1,
    color: COLORS.brand,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: "row",
  },
  customerRow: {
    justifyContent: "flex-end",
  },
  vendorRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  customerBubble: {
    backgroundColor: COLORS.brand,
    borderBottomRightRadius: 6,
  },
  vendorBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  customerMessageText: {
    color: COLORS.card,
  },
  vendorMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "800",
    alignSelf: "flex-end",
  },
  customerMessageTime: {
    color: "rgba(255,255,255,0.62)",
  },
  vendorMessageTime: {
    color: COLORS.muted,
  },
  quickReplies: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  quickReply: {
    marginHorizontal: 4,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  quickReplyText: {
    color: COLORS.brand,
    fontSize: 12,
    fontWeight: "900",
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 16 : 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: Platform.OS === "android" ? 6 : 10,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },
});