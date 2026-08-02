"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select, Modal, EmptyState, Loading, Badge } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER" as "USER" | "ADMIN",
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await fetchAPI<User[]>("/api/admin/users");
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      alert("用户名和密码不能为空");
      return;
    }
    await fetchAPI("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setFormOpen(false);
    setForm({ username: "", password: "", role: "USER" });
    loadUsers();
  };

  const handleToggleActive = async (user: User) => {
    await fetchAPI(`/api/admin/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    loadUsers();
  };

  const handleChangeRole = async (userId: string, role: "USER" | "ADMIN") => {
    await fetchAPI(`/api/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    loadUsers();
  };

  const handleOpenResetPassword = (userId: string) => {
    setResetUserId(userId);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !resetUserId) return;
    await fetchAPI(`/api/admin/users/${resetUserId}`, {
      method: "PUT",
      body: JSON.stringify({ password: newPassword }),
    });
    setPasswordModalOpen(false);
    setResetUserId(null);
    setNewPassword("");
    alert("密码已重置");
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`确定要删除用户 ${user.username} 吗？该用户所有数据将被永久删除，无法恢复！`)) return;
    await fetchAPI(`/api/admin/users/${user.id}`, { method: "DELETE" });
    loadUsers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink-primary">用户管理</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingUser(null);
            setForm({ username: "", password: "", role: "USER" });
            setFormOpen(true);
          }}
        >
          + 新建用户
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState title="暂无用户" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-secondary">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-ink-tertiary">用户名</th>
                <th className="text-left p-3 text-xs font-medium text-ink-tertiary">角色</th>
                <th className="text-left p-3 text-xs font-medium text-ink-tertiary">状态</th>
                <th className="text-left p-3 text-xs font-medium text-ink-tertiary">创建时间</th>
                <th className="text-right p-3 text-xs font-medium text-ink-tertiary">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-bg-tertiary">
                  <td className="p-3 text-sm text-ink-primary">{user.username}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as "USER" | "ADMIN")}
                      className="input text-xs py-1 px-2 w-auto"
                    >
                      <option value="USER">普通用户</option>
                      <option value="ADMIN">管理员</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <Badge color={user.isActive ? "moss" : "gray"}>
                      {user.isActive ? "正常" : "已禁用"}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-ink-hint">
                    {formatDate(user.createdAt, "yyyy-MM-dd")}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? "禁用" : "启用"}
                    </button>
                    <button
                      className="text-xs text-amber-600 hover:text-amber-700"
                      onClick={() => handleOpenResetPassword(user.id)}
                    >
                      重置密码
                    </button>
                    <button
                      className="text-xs text-coral-600 hover:text-coral-700"
                      onClick={() => handleDelete(user)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create user modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="新建用户"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="用户名"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="输入用户名"
          />
          <Input
            label="初始密码"
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="输入初始密码"
          />
          <Select
            label="角色"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as "USER" | "ADMIN" })}
            options={[
              { value: "USER", label: "普通用户" },
              { value: "ADMIN", label: "管理员" },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>取消</Button>
            <Button variant="primary" onClick={handleCreate}>创建</Button>
          </div>
        </div>
      </Modal>

      {/* Reset password modal */}
      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="重置密码"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="新密码"
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="输入新密码"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>取消</Button>
            <Button variant="primary" onClick={handleResetPassword}>确认重置</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
