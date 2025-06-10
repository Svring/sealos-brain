'use client'

import React from 'react'
import { User } from '@/payload-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User2, Mail, Shield, Key } from 'lucide-react'

interface UserCenterProps {
  user: User | null
}

export function UserCenter({ user }: UserCenterProps) {
  if (!user) {
    return (
      <div className="w-full p-4">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-16 h-16">
            <AvatarFallback>
              <User2 className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">Not logged in</p>
        </div>
      </div>
    )
  }

  const getAvatarUrl = () => {
    if (typeof user.avatar === 'object' && user.avatar?.url) {
      return user.avatar.url
    }
    return undefined
  }

  const getUserInitials = () => {
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const tokenCount = user.tokens?.length || 0

  return (
    <div className="w-full p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar */}
        <Avatar className="w-16 h-16">
          <AvatarImage src={getAvatarUrl()} alt={user.username || user.email} />
          <AvatarFallback className="text-lg font-semibold">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex flex-col items-center space-y-2 w-full">
          {/* Username */}
          {user.username && (
            <div className="flex items-center space-x-2">
              <User2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm truncate max-w-[150px]" title={user.username}>
                {user.username}
              </span>
            </div>
          )}

          {/* Email */}
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={user.email}>
              {user.email}
            </span>
          </div>

          {/* Role Badge */}
          {user.role && (
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {user.role}
              </Badge>
            </div>
          )}

          <Separator className="w-full" />

          {/* Token Count */}
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {tokenCount} token{tokenCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Token Types */}
          {user.tokens && user.tokens.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {Array.from(new Set(user.tokens.map(token => token.type || 'custom'))).map((type) => (
                <Badge key={type} variant="outline" className="text-xs px-2 py-0">
                  {type}
                </Badge>
              ))}
            </div>
          )}

          {/* Account Created */}
          <div className="text-xs text-muted-foreground text-center">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
