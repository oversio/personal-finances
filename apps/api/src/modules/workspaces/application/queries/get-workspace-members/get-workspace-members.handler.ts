import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "@/modules/users/application";
import { WORKSPACE_MEMBER_REPOSITORY, type WorkspaceMemberRepository } from "../../ports";
import { GetWorkspaceMembersQuery } from "./get-workspace-members.query";

export interface WorkspaceMemberWithUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  picture: string | undefined;
  role: string;
  invitedAt: Date;
  joinedAt: Date | undefined;
  isActive: boolean;
}

@Injectable()
export class GetWorkspaceMembersHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetWorkspaceMembersQuery): Promise<WorkspaceMemberWithUser[]> {
    const members = await this.memberRepository.findByWorkspaceId(query.workspaceId);

    const membersWithUsers = await Promise.all(
      members.map(async member => {
        const user = await this.userRepository.findById(member.userId.value);

        return {
          id: member.id!.value,
          userId: member.userId.value,
          email: user?.email.value ?? "",
          name: user?.name.value ?? "",
          picture: user?.picture,
          role: member.role.value,
          invitedAt: member.invitedAt,
          joinedAt: member.joinedAt,
          isActive: member.isActive,
        };
      }),
    );

    // Sort: owners first, then admins, then members
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    return membersWithUsers.sort(
      (a, b) =>
        (roleOrder[a.role as keyof typeof roleOrder] ?? 3) -
        (roleOrder[b.role as keyof typeof roleOrder] ?? 3),
    );
  }
}
